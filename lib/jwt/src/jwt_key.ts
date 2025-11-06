import { JsonWebKey } from "node:crypto";
import * as FileModule from "node:fs/promises";
import * as Crypto from "node:crypto";
import {JwtHeaderRsaPublicKey} from "@core/types/jwt-types";

export class	JwtRsaPublicKey {

	private	_public_key_url: string | undefined;
	private	_public_key: string = "";
	private	_struct: Pick<JwtHeaderRsaPublicKey, "alg" | "use" | "kty" | "key_ops"> = {
		alg: "RS256",
		use: "sig",
		kty:"RSA",
		key_ops: ["verify"],
	};

	get		struct() {return ({n: "", e: "", ...this._struct});}
	set		struct(jhrpk: JwtHeaderRsaPublicKey) {this._struct = {...jhrpk, ...this._struct}}
	set		public_key_url(public_key_url: string) {this._public_key_url = public_key_url}
	set		public_key(public_key: string) {this._public_key = public_key}

	constructor(public_key_url?: string, jhrpk?: Partial<JwtHeaderRsaPublicKey>) {
		if (jhrpk != undefined)
			this._struct = {...jhrpk, ...this._struct};
		if (public_key_url != undefined)
			this._public_key_url = public_key_url;
	}

	/*
		* Allow the proper construction of the JWK object to make able a correctly
		* working of ft_getJwk method.
	*/
	public async	ft_build(): Promise<boolean> {
		try {
			if (this._public_key_url != undefined)
				this._public_key = await FileModule.readFile(this._public_key_url, {
						encoding: "utf8"
				});
			return (true);
		}
		catch (error) {
			console.error("An error ocurrs trying to read the public_key_url");
			return (false);
		}
	}

	/*return {JwtHeaderRsaPublicKey | undefined}: Allow to make the object a jwk format object.*/
	public ft_getJwk(): JwtHeaderRsaPublicKey {
		const	jwk = Crypto.createPublicKey(this._public_key).export({format: "jwk"});
		return ({n: jwk.n ?? "", e: jwk.e ?? "", ...this._struct});
	}

	public	ft_JwkToPublicKey(jwk: JwtHeaderRsaPublicKey): string | undefined {
		if (jwk == undefined)
			return ;
		const	json_wk: JsonWebKey = {
			n: jwk.n,
			e: jwk.e,
			kty: jwk.kty
		}
		const	public_key = Crypto.createPublicKey({key: json_wk, format: "jwk"});
		return (public_key.export({format: "pem", type: "pkcs1"}).toString("utf8"));
	}
}
