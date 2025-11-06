import { OauthServer } from "@services/server";
import { JwtSignature, JwtRsaPublicKey, JwtHeaderRsaPublicKey, JwtInsecure, JwtPayload } from "@segfaultx/jwt";
import { CONSTANTS, SERVICES } from "@core/constants/constants";
import { OauthDao } from "@core/dao/oauth_dao";
import { AuthInstance, ClientDB, ClientId, ClientRegistrationRequest, Credential, ErrorRes, GsiReceiverData, GsiUserInfo, OauthPlugin, PubK, Routes, TokenEntity } from "@oauth-types/oauth";
import { createHash, randomUUID, UUID } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import querystring	from "node:querystring";
import { Http, IncomingMsg } from "@segfaultx/http";
import fastifyStatic from "@fastify/static";
import * as Path from "node:path";
import type { FastifyCookieOptions } from "@fastify/cookie";
import Cookie from "@fastify/cookie";
import { ServerResponse } from "node:http";

export class OauthService extends OauthServer {
	private	static	game_service: OauthService | null = null;
	/*What is this id_sessions for? Maybe it's for handle the differents
	* request sessions needed for differents client that want to authenticate.
	* this variable will keep track of each flow process.
	* The key must be an UUID to avoid collisions between the same client
	* from different hosts.*/
	private			id_sessions: Map<UUID, AuthInstance> = new Map();
	private			gsi_sessions: Map<UUID, GsiReceiverData> = new Map();
	private			code_sessions: Map<string, AuthInstance> = new Map();
	private			oauth_db: OauthDao = new OauthDao();
	private			oauth_client = new OAuth2Client();
	private			domain = `${CONSTANTS.HOSTNAME}:${CONSTANTS.PORT}`;
	private			http = new Http();
	/*provider_uri refers to the service designated to verify the user info and
	* handle the gsi_user_info.*/
	private			provider_uri = `http://${CONSTANTS.UD_HOST}:${CONSTANTS.UD_PORT}`;
	private			mock_provider_uri = "http://jsonplaceholder.typicode.com/posts"
	private			public_key_oauth_url = `${CONSTANTS.SHARED_FOLDER}/${CONSTANTS.PUBLIC_KEY}`;
	private			private_key_oauth_url = `${CONSTANTS.SHARED_FOLDER}/${CONSTANTS.PRIVATE_KEY}`;
	private			jws = new JwtSignature({
		header: {alg: "RS256", typ: "JWT"},
		private_key_url: this.private_key_oauth_url,
		public_key_url: this.public_key_oauth_url
	});
	private			is_jws_loaded: boolean = false;
	private			oauth_pub_key: JwtHeaderRsaPublicKey | undefined;
	private			self_token: string | undefined;
	private			exp_self_token: number = 0;
	protected		plugins: OauthPlugin[] = [
		{
			module: fastifyStatic,
			payload: {
				root: Path.join(__dirname, CONSTANTS.BROWSER_DIR)
			},
		},
		{
			module: Cookie,
			payload: {
				secret: CONSTANTS.COOKIE_SECRET,
			}
		}
	]
	protected		routes: Routes[] = [
		{
			method: "GET",
			url: SERVICES.auth,
			handler: (req: any, rep: any) => this.ft_authHandler(req, rep)
		},
		{
			method: "POST",
			url: SERVICES.register,
			handler: (req: any, rep: any) => this.ft_registerClientHandler(req, rep),
			schema: CONSTANTS.SCHEMA.REGISTER
		},
		{
			method: "POST",
			url: SERVICES.token,
			handler: (req: any, rep: any) => this.ft_tokenHandler(req, rep)
		},
		{
			method: "POST",
			url: SERVICES.callback,
			handler: (req: any, rep: any) => this.ft_gsiCallback(req, rep)
		},
		{
			method: "GET",
			url: `${SERVICES.redirect_owner}/:endpoint_angular`,
			handler: (req: any, rep: any) => this.ft_authOwnerHandler(req, rep)
		},
		{
			method: "POST",
			url: `${SERVICES.response_owner}`,
			handler: (req: any, rep: any) => this.ft_repOwnerHandler(req, rep),
			schema: CONSTANTS.SCHEMA.AUTHORIZATION
		},
		{
			method: "POST",
			url: SERVICES.signin,
			handler: (req: any, rep: any) => this.ft_signinResourceOwner(req, rep),
			schema: CONSTANTS.SCHEMA.SIGNIN
		},
		{
			method: "GET",
			url: `${SERVICES.gsi_receiver}/*`,
			handler: (req: any, rep: any) => this.ft_gsiCallbackReceiver(req, rep)
		},
		{
			method: "OPTIONS",
			url: "*",
			handler: (req: any, rep: any) => {
				let	getters = req.url === SERVICES.auth;
				getters ||= req.url === SERVICES.gsi_receiver;
				getters ||= req.url.includes(SERVICES.redirect_owner);
				rep.header("Access-Control-Allow-Origin", "*");
				const methods = getters ? "GET" : "POST";
				rep.header("Access-Control-Allow-Methods", methods);
				rep.header("Access-Control-Allow-Headers", "*");
				return (rep.send());
			}
		}
	];

	constructor () {
		super();
		if (OauthService.game_service)
			return (this);
		/*[PENDING]: REmove the mock_provider_uri.*/
		this.provider_uri = this.mock_provider_uri;
		OauthService.game_service = this;
		this.ft_startServer();
		const	jwk = new JwtRsaPublicKey(this.public_key_oauth_url);
		jwk.ft_build().then((res: boolean) => {
			if (res)
				this.oauth_pub_key = jwk.ft_getJwk();
		});
		this.jws.ft_build().then((res: boolean) => this.is_jws_loaded = res);
	}

	/*Serves the index file to sign the resource owner in.*/
	private	ft_authOwnerHandler(req: any, rep: any): void {
		const	{error} = req.query;
		const	auth_instance = this.ft_getAuthInstanceFromRequest(req);
		if (error == undefined && auth_instance == undefined)
			return (rep.code(404).send({message: "Not found"}));
		return (rep.sendFile(CONSTANTS.INDEX_FILE));
	}

	private	ft_repOwnerHandler(req: any, rep: any): void {
		const	auth_instance = this.ft_getAuthInstanceFromRequest(req);
		if (auth_instance == undefined)
			return (rep.code(404).send({message: "Not found"}));
		const	access = req.body.access;
		let	redirect = auth_instance.client.redirection_uri;
		if (access == "allowed") {
			const	redirect_owner = `${SERVICES.redirect_owner}/login`;
			return (rep.send({redirect_uri: redirect_owner}));
		}
		else if (access == "denied") {
			redirect += `/?${querystring.encode({
				error: "access_denied",
				error_description: "The owner has denied you the access.",
				state: auth_instance.state
			})}`;
			return (rep.send({redirect_uri: redirect}));
		}
		else {
			redirect += `/?${querystring.encode({
				error: "server_error",
				error_description: "The server couldn't fulfilled the request.",
				state: auth_instance.state
			})}`;
			return (rep.send({redirect_uri: redirect}));

		}
	}

	/*Verify credential from the resource owner against the provider_uri*/
	private	async	ft_verifyCredential(cred: Credential): Promise<boolean> {
		const	token = await this.ft_selfToken();
		if (token == undefined)
			return (false);
		return (await this.http.ft_post(this.provider_uri, {
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"Authorization": `Bearer ${token}`
			},
			data: {
				credential: cred 
			}
		}).then((msg: IncomingMsg) => {
			if (msg.http.statusCode == undefined)
				return (false);
			if (msg.http.statusCode < 200 || msg.http.statusCode > 206)
				return (false);
			return (true);
		}).catch((_e: Error) => {
			return (false);
		}));
	}

	/*Return the AuthInstance in case there be a match.*/
	private	ft_getAuthInstanceFromRequest(req: any): AuthInstance | undefined {
		const	auth_ssid = req?.cookies?.sg_auth_ssid;
		const	code = req.body?.code;
		if (auth_ssid != undefined && this.id_sessions.has(auth_ssid))
			return (this.id_sessions.get(auth_ssid));
		else if (code != undefined && this.code_sessions.has(code))
			return (this.code_sessions.get(code));
		else
			return (undefined)
	}

	/*Validate the credential from the resource owner.*/
	/*Scheme depending on body credential*/
	private	async	ft_signinResourceOwner(req: any, rep: any): Promise<void> {
		const	auth_instance = this.ft_getAuthInstanceFromRequest(req);
		if (auth_instance == undefined)
			return (rep.code(404).send({message: "Not found"}));
		if (await this.ft_verifyCredential(req.body.credential)) {
			auth_instance.auth_code = randomUUID();
			this.code_sessions.set(auth_instance.auth_code, auth_instance);
			const	redirect = this.ft_authorizationResponseUri(auth_instance);
			return (rep.send({redirect_uri: redirect}));
		}
		return (rep.code(403).send({message: "Invalid credential"}));
	}

	private	ft_validateRequestAuthEndpoint(req: any): boolean {
		const	{response_type, state} = req.query;
		if (response_type != "code")
			return (false);
		if (state.length < 42)
			return (false);
		return (true);
	}

	private	ft_authHandler(req: any, rep: any): void {
		const	{client_id, response_type, state, redirect_uri} = req.query;
		if (! this.oauth_db.ft_isClientRegistered(client_id)) {
			const	rd = `${SERVICES.redirect_owner}/error?error=client_id`;
			return (rep.redirect(rd));
		}
		const	client = this.oauth_db.ft_getClient(client_id)!;
		if (redirect_uri != undefined && client.redirection_uri != redirect_uri) {
			const	rd = `${SERVICES.redirect_owner}/error?error=redirect_uri`;
			return (rep.redirect(rd));
		}
		if (! this.ft_validateRequestAuthEndpoint(req)) {
			let	error = querystring.encode({
				error: "invalid_request",
				error_description: "client_id, state or response_type invalid"
			});
			return (rep.redirect(`${client.redirection_uri}/?${error}`));
		}
		const ssid = randomUUID();
		rep.header(
			"Set-Cookie",
			`sg_auth_ssid=${ssid}; Path=/; SameSite=Lax; Secure; HttpOnly`
		);
		this.id_sessions.set(ssid, {
			client: client,
			response_type: response_type,
			state: state
		});
		if (client.client_type == "public")
			return (rep.redirect(`${SERVICES.redirect_owner}/access_form`));
		else
			return (rep.redirect(`${SERVICES.redirect_owner}/login`));
	}

	private	ft_validateRegisterPayload(record: ClientRegistrationRequest, rep: any): boolean {
		const	client_type = record.client_type.toLowerCase();
		if (client_type != "confidential" && client_type != "public") {
			rep.code(400).send({
				error: "Client_type not valid, must be confidential | public"
			});
			return (false);
		}
		else if (record.redirection_uri.includes("#")) {
			rep.code(400).send({
				error: "invalid uri, must not include fragment component"
			});
			return (false);
		}
		else if (record.public_key.kty != "RSA") {
			rep.code(400).send({
				error: "public_key not valid, must be RSA type"
			});
			return (false);
		}
		return (true);
	}

	/*
		* Allow to register a Client, but also with the redirection_uri,
		* the JsonPublicKey and the client_type find out its client_id.*/
	private	ft_registerClientHandler(req: any, rep: any): void {
		rep.header("Access-Control-Allow-Origin", "*");
		const {client_type, redirection_uri, public_key}: ClientRegistrationRequest = req.body;
		if (! this.ft_validateRegisterPayload(req.body, rep))
			return ;
		const	hash = createHash("sha256");
		hash.update(`${client_type}:${redirection_uri}:${public_key}`);
		const	client_id = hash.digest("base64url");
		let		is_registered = false;
		let		client_info = {
			client_id: client_id,
			client_type: client_type,
			redirection_uri: redirection_uri,
			public_key: public_key
		};
		if (! this.oauth_db.ft_isClientRegistered(client_id))
			is_registered = this.oauth_db.ft_clientRegistration(client_info);
		else
			return (rep.send(client_info));
		if (is_registered)
			return (rep.send(client_info));
		else
			return (rep.code(500).send({error: "DB failed" }));
	}

	private	async	ft_authClient(pbk: PubK, token: string): Promise<boolean> {
		const	jwkc = new JwtRsaPublicKey();
		await	jwkc.ft_build();
		const	spbk = jwkc.ft_JwkToPublicKey(pbk);
		if (spbk == undefined)
			return (false);
		const	jwsc = new JwtSignature({
			header: {alg: "RS256", typ: "JWT"},
		});
		jwsc.public_key = spbk;
		await jwsc.ft_build();
		if (! await jwsc.ft_verify(token))
			return (false);
		return (true);
	}

	private	ft_getAuthFromHeader(req: any): string | undefined {
		let	authorization: string = req.headers.authorization;
		if (authorization == undefined || ! authorization.includes("Bearer"))
			return ;
		authorization = authorization.trim().replace(/Bearer\s*/, "")
		return (authorization);
	}

	private	ft_getClientFromToken(token: string): ClientDB | ErrorRes {
		const	payload = JwtInsecure.ft_decode(token) as JwtPayload;
		if (payload.client_id == undefined)
			return ({error: "Must define client_id", code: 400});
		if (! this.oauth_db.ft_isClientRegistered(payload.client_id))
			return ({error: "Not Authorized", code: 401});
		return (this.oauth_db.ft_getClient(payload.client_id)!);
	}

	/*
		* Handle Client Credentials Grant.
		* The client's credential must got the client_id, otherwise is useless
		* and must be signed.*/
	private	async	ft_tokenClientGrant(req: any, rep: any): Promise<void> {
		const	authorization = this.ft_getAuthFromHeader(req);
		if (authorization == undefined)
			return (rep.code(406).send({error: "Not Bearer Token"}));
		let	client = this.ft_getClientFromToken(authorization);
		if (Object.keys(client).includes("error")) {
			client = client as ErrorRes;
			return (rep.code(client.code).send(client.error));
		}
		client = client as ClientDB;
		if (! await this.ft_authClient(client.public_key, authorization))
			return (rep.code(403).send({error: "access_denied"}));
		const	token = await this.ft_getToken(
			client.public_key
		);
		if (token == undefined)
			return (rep.code(500).send({error: "Failed Jws"}));
		return (rep.send({token: token.token}));
	}

	/*
		* Handle Authorization Grant Code Flow.*/
	private	async	ft_tokenAuthGrant(req: any, rep: any): Promise<void> {
		const	auth_instance = this.ft_getAuthInstanceFromRequest(req);
		if (auth_instance == undefined || req.body == undefined)
			return (rep.code(404).send({error: "Not Found"}));
		const	client = auth_instance.client;
		const	{code, redirect_uri, client_id} = req.body;
		if (client.client_type == "confidential") {
			const	authorization = this.ft_getAuthFromHeader(req);
			if (authorization == undefined)
				return (rep.code(406).send({error: "No Bearer Token"}));
			if (! await this.ft_authClient(client.public_key, authorization))
				return (rep.code(403).send({error: "access_denied"}));
		}
		if (auth_instance.auth_code != code) {
			return (rep.code(400).send({error: "invalid_request"}));
		}
		if (client.redirection_uri != redirect_uri) {
			return (rep.code(400).send({error: "redirect_uri"}));
		}
		if (client.client_id != client_id) {
			return (rep.code(400).send({error: "client_id"}));
		}
		const	token = await this.ft_getToken(
			client.public_key,
			auth_instance.gsi_token
		);
		if (token == undefined)
			return (rep.code(500).send({error: "Failed Jws"}));
		return (rep.send({token: token.token}));
	}
	/*
		* Resource Owner Password Credential Grant.
		* This is compulsory to properly work with CLI, because it's the
		* owner who is authenticating itself in a hard environment to 
		* implement Authorization Code Flow.
		* The client which request the token must include the client_id,
		* thus is possible to create a valid SegfaultxToken. Otherwise 
		* there is not way.*/
	private	async	ft_tokenOwnerGrant(req: any, rep: any): Promise<void> {
		const	{client_id, username, password} = req.body;
		const	authorization = this.ft_getAuthFromHeader(req);
		if (! this.oauth_db.ft_isClientRegistered(client_id))
			return (rep.code(401).send({error: "Not Authorized"}));
		const	client = this.oauth_db.ft_getClient(client_id)!;
		if (authorization != undefined) {
			if (! await this.ft_authClient(client.public_key, authorization))
				return (rep.code(403).send({error: "access_denied"}));
		}
		const	isGranted = await this.ft_verifyCredential({
			email: username,
			password: password
		});
		if (! isGranted)
			return (rep.code(403).send({error: "access_denied"}));
		const	token = await this.ft_getToken(
			client.public_key
		);
		if (token == undefined)
			return (rep.code(500).send({error: "Failed Jws"}));
		return (rep.send({token: token.token}));
	}

	private	async ft_tokenHandler(req: any, rep: any): Promise<void> {
		rep.header("Access-Control-Allow-Origin", "*");
		const	grant_type = req.body.grant_type;
		switch (grant_type) {
			case "authorization_code":
				await this.ft_tokenAuthGrant(req, rep);
				break ;
			case "client_credentials":
				await this.ft_tokenClientGrant(req, rep);
				break ;
			case "password":
				await this.ft_tokenOwnerGrant(req, rep);
				break;
			default:
				return (rep.code(400).send({error: "invalid_request"}));
		}
	}

	/*This function is intended to set the token to be served to the clients.*/
/**
	* @param {public_key} public_key - The client's public key in Jwk structure.
	* @param {gsi_token} gsi_token - The Google Sign In token if the client authenticate through it. 
*/
	private	async ft_getToken(public_key: JwtHeaderRsaPublicKey, gsi_token?: string): Promise<TokenEntity | undefined> {
		const	now = Date.now();
		this.jws.payload = {
			iss: "auth.segfaultx.com",
			sub: "segfaultx",
			aud: "segfaultx_services",
			exp: now + (60 * 1000 * 60),
			nbf: now - (60 * 1000 * 60),
			iat: now,
			jti: `${now}`,
			public_key: public_key,
			gsi_token: gsi_token ?? ""
		}
		if (this.is_jws_loaded) {
			return ({
				token: await this.jws.ft_encode(),
				payload: this.jws.payload
			});
		}
	}

	/*Sign its own token.*/
	private async	ft_selfToken(): Promise<string | undefined> {
		const	now = Date.now();
		if (this.exp_self_token > now && this.self_token != undefined)
			return (this.self_token);
		if (this.oauth_pub_key && this.is_jws_loaded) {
			const	token_entity = await this.ft_getToken(this.oauth_pub_key);
			if (token_entity == undefined)
				return ;
			this.exp_self_token = token_entity.payload.exp ?? 0;
			this.jws.payload = { token: token_entity.token };
			return (this.jws.ft_encode());
		}
	}

	/*Re-Send the information got from Gsi to Provider (User data service),
	* thus we save it just in case.*/
	private	async	ft_notifyGsiUserToProvider(gsi_user_info: GsiUserInfo): Promise<boolean> {
		const	token = await this.ft_selfToken();
		if (token == undefined)
			return (false);
		return (await this.http.ft_post(this.provider_uri, {
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"Authorization": `Bearer ${token}`
			},
			data: {
				gsi_user_info: gsi_user_info
			}
		}).then((msg: IncomingMsg) => {
			if (msg.http.statusCode == undefined)
				return (false);
			if (msg.http.statusCode < 200 || msg.http.statusCode > 206)
				return (false);
			return (true);
		}).catch((_e: Error) => {
			return (false);
		}));
	}

	/*Generate the redirection uri with the authorization_code*/
	private	ft_authorizationResponseUri(auth_instance: AuthInstance): string | undefined {
		if (auth_instance.auth_code == undefined)
			return (undefined);
		let	redirect = auth_instance.client.redirection_uri;
		redirect += `/?${querystring.encode({
			code: auth_instance.auth_code,
			state: auth_instance.state
		})}`;
		return (redirect);
	}

	private	async	ft_gsiCallbackReceiver(req: any, rep: any): Promise<void> {
		const	auth_instance = this.ft_getAuthInstanceFromRequest(req);
		let		redir = `${SERVICES.redirect_owner}/error`;
		redir += `?${querystring.encode({error: "client_id"})}`;
		const	{gsi_uuid, error} = req.query;
		if (error != undefined && auth_instance != undefined) {
			let	rd = auth_instance.client.redirection_uri;
			rd += `/?${querystring.encode({error: "access_denied"})}`;
			return (rep.redirect(rd));
		}
		if (auth_instance == undefined || gsi_uuid == undefined)
			return (rep.redirect(redir));
		if (! this.gsi_sessions.has(gsi_uuid))
			return (rep.redirect(redir));
		const	gsi_rec_data = this.gsi_sessions.get(gsi_uuid)!;
		this.gsi_sessions.delete(gsi_uuid);
		if (await this.ft_notifyGsiUserToProvider(gsi_rec_data.user_info)) {
			auth_instance.gsi_token = gsi_rec_data.gsi_credential;
			auth_instance.auth_code = randomUUID();
			this.code_sessions.set(auth_instance.auth_code, auth_instance);
			const	redirect = this.ft_authorizationResponseUri(auth_instance);
			return (rep.redirect(redirect));
		}
	}

	private async	ft_gsiCallback(req: any, rep: any): Promise<void> {
		let	redir = `http://${this.domain}${SERVICES.gsi_receiver}/?`;
		const	ticket = await this.oauth_client.verifyIdToken({
			idToken: req.body.credential,
			audience: CONSTANTS.WEB_CLIENT_ID
		}).catch((_error) => {
			rep.redirect(redir);
		});
		if (ticket == undefined) {
			redir += querystring.encode({error: "gsi_access_denied"});
			return (rep.redirect(redir));
		}
		const	payload = ticket.getPayload();
		if (payload == undefined) {
			redir += querystring.encode({error: "gsi_access_denied"});
			return (rep.redirect(redir));
		}
		const	exp_time = payload.exp * 1000;
		const	now = Date.now();
		if (exp_time - now < 0)
			return (rep.redirect(redir));
		const	user_info: GsiUserInfo = {
			email: payload.email,
			email_verified: payload.email_verified,
			family_name: payload.family_name,
			given_name: payload.given_name,
			name: payload.name,
			picture: payload.picture
		};
		const	gsi_uuid = randomUUID();
		this.gsi_sessions.set(gsi_uuid, {
			user_info: user_info,
			gsi_credential: req.body.credential
		});
		redir += querystring.encode({gsi_uuid: gsi_uuid});
		return (rep.redirect(redir));
	}
}
