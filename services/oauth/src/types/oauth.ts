import { JwtHeaderRsaPublicKey, JwtPayload } from "@segfaultx/jwt";

export type	ConfigOauthServer = {port: number, host?: string, [key: string]: boolean | number | string | undefined};
export type	Routes = { method: string, url: string, handler?: Function, [key: string]: unknown};
export type Fastify = any;

export type PubK = JwtHeaderRsaPublicKey;
export type	ErrorRes = {error: string, code: number};
export type	ClientId = string;
export interface	ClientRegistrationRequest {
	client_type: string,
	redirection_uri: string,
	public_key: JwtHeaderRsaPublicKey
};

/**
	* @param {client_type} client_type - The client type must be confidential or public.
	* @param {redirection_uri} redirection_uri - The uri to be the user agent redirected to client endpoint. must be base64url encoded.
	* @param {public_key} public_key - The client's public key in Jwk structure.
	* @param {client_id} client_id - The client's identification.
*/
export interface	ClientDB extends ClientRegistrationRequest {
	client_id: ClientId,
};

export type	SelectedResponse<Type> = {
	[Property in keyof Type]: string
};

export interface	Credential {
	email: string,
	password: string
};

export interface	AuthInstance {
	client: ClientDB,
	response_type: string,
	state: string,
	auth_code?: string
	gsi_token?: string
};

export interface	OauthPlugin {
	module: any, payload: {[index: string]: any}
};
export interface	GsiUserInfo {
	email?: string,
	email_verified?: boolean,
	family_name?: string,
	given_name?: string,
	name?: string,
	picture?: string
};

export interface	TokenEntity {
	token: string,
	payload: JwtPayload 
};

export	interface	GsiReceiverData {
	user_info: GsiUserInfo,
	gsi_credential: string
};
