import { Jwt } from "@core/ajwt";
import * as FileModule from "node:fs/promises";
import * as Crypto from "node:crypto";
import { JwtRsaPublicKey } from "@core/jwt_key";
import {JwtHeaderSignature, JwtPayload, JwtPayloadSecure, JwtHeaderInsecure, JwtPayloadInsecure} from "@core/types/jwt-types";

export class	JwtSignature extends Jwt {

	private		_header: JwtHeaderSignature = {alg: "RS256"};
	private		_payload: JwtPayload = {};
	private		_private_key: string = "";
	private		_public_key: string = "";
	private		_public_key_url: string | undefined;
	private		_private_key_url: string | undefined;

	get			header() {return (this._header);}
	set			header(jhs: JwtHeaderSignature) {this._header = {...jhs, alg: "RS256"}}
	get			payload() {return (this._payload);}
	set			payload(jp: JwtPayload) {this._payload = jp}
	set			private_key_url(private_key: string) {this._private_key_url = private_key} 
	set			public_key_url(public_key: string) {this._public_key_url = public_key}
	set			public_key(public_key: string) {this._public_key = public_key}
	set			private_key(private_key: string) {this._private_key = private_key}

	constructor (config?: {
		header?: JwtHeaderSignature,
		payload?: JwtPayloadSecure,
		private_key_url?: string,
		public_key_url?: string
	}) {
		super();
		if (config != undefined) {
			if (config.header != undefined)
				this._header = {...config.header, ...this._header};
			if (config.payload != undefined)
				this._payload = config.payload;
			if (config.private_key_url != undefined)
				this._private_key_url = config.private_key_url;
			if (config.public_key_url != undefined)
				this._public_key_url = config.public_key_url;
		}
	}

	/*
		* Allow the proper construction of the JWS object to make able a correctly
		* working of ft_encode and ft_verify methods.
	*/
	public async	ft_build(): Promise<boolean> {
		try {
			if (this._private_key_url != undefined)
				this._private_key = await FileModule.readFile(this._private_key_url, {
						encoding: "utf8"
				});
			if (this._public_key_url != undefined)
				this._public_key = await FileModule.readFile(this._public_key_url, {
						encoding: "utf8"
				});
			return (true);
		}
		catch (error) {
			console.error("An error ocurred trying to read (private/public)_key_url");
			return (false);
		}
	}

	/*
	* required {private_key_url}: This key is required to properly sign the JWS object.
	*/
	public async	ft_encode(): Promise<string> {
		const	header_encoded = this.ft_encodeObject(this._header);
		const	payload_encoded = this.ft_encodeObject(this._payload);
	    const	sign = Crypto.createSign("RSA-SHA256");
		sign.write(`${header_encoded}.${payload_encoded}`);
		sign.end();
		let	signature_encoded;
		if (this._private_key != undefined)
			signature_encoded = sign.sign(this._private_key, "base64url");
		return (`${header_encoded}.${payload_encoded}.${signature_encoded}`);
	}

	/*
		* param {encoded}: Receive the jwt in Compact Serialization format
	*	return {JwtSignature}: Return an Insecured JwtSignature object.
	* */
	public static	ft_decodeSigned(encoded: string): JwtSignature {
		const	[header_decoded, payload_decoded] = this.ft_decode(encoded);
		return (new JwtSignature({
			header: header_decoded as JwtHeaderInsecure,
			payload: payload_decoded as JwtPayloadInsecure
		}));
	}

	/*
		* param {jws}: The JWS used to verification. Only RS256 is supported.
		* required {public_key_url}: The public key is needed to make the verification properly
		*	otherwise it won't be possible
	*/
	public async	ft_verify(jws: string): Promise<boolean> {
		if (jws == undefined)
			return (false);
		const	[header, payload, signature] = jws.split(".");
		const	object_to_verify = `${header}.${payload}`;
		const	verify = Crypto.createVerify("RSA-SHA256");
		verify.write(object_to_verify);
		verify.end();
		let	verified;
		if (this._public_key != undefined)
			verified = verify.verify(this._public_key, signature, "base64url");
		return (verified ?? false);
	}
	
	public static async	ft_verifySegfaultxToken(jwc_encoded: string, oauth_public_key: string): Promise<boolean> {
		if (jwc_encoded == undefined || oauth_public_key == undefined)
			return (false);
		const	jwk = new JwtRsaPublicKey();
		const	jwc_decoded = JwtSignature.ft_decodeSigned(jwc_encoded);
		if (jwc_decoded.payload?.token == undefined)
			return (false);
		const	jws_decoded = JwtSignature.ft_decodeSigned(jwc_decoded.payload.token);
		/*Client public key given by oauth server.*/
		jws_decoded.public_key = oauth_public_key;
		if (jws_decoded.payload?.public_key == undefined)
			return (false);
		jwc_decoded.public_key = jwk.ft_JwkToPublicKey(jws_decoded.payload.public_key) ?? "";
		const	verify_client = await jwc_decoded.ft_verify(jwc_encoded);
		const	verify_oauth = await jws_decoded.ft_verify(jwc_decoded.payload.token);
		return (verify_client && verify_oauth);
	}
}
