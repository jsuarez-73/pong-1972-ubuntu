import {JwtSignature, JwtRsaPublicKey, JwtInsecure} from "../dist/jwt.js";
import * as FileModule from "node:fs/promises";

(async () => {
	const	client_public_jwk = new JwtRsaPublicKey("./test/credentials_client/public_key_client");
	await client_public_jwk.ft_build();
	const	jwt_signature_token = new JwtSignature({
		header: {typ: "JWT"},
		payload: {
			public_key: client_public_jwk.ft_getJwk(),
			access: true
		},
		private_key_url: "./test/credentials_oauth/private_key_oauth"
	});
	await jwt_signature_token.ft_build();
	/*Malicious trying to set its public key and use the oauth's signature segment.
	* Sending the token with its signature and the payload altered*/
	const	malicious_public_jwk = new JwtRsaPublicKey("test/credentials_malicious/public_key_malicious");
	await malicious_public_jwk.ft_build();
	const	token_encoded = await jwt_signature_token.ft_encode();
	const	malicious_jwt_insecure = new JwtInsecure({
		header: {typ: "JWT"},
		payload: {
			public_key: malicious_public_jwk.ft_getJwk(),
			access: true
		}
	});
	const	malicious_encoded = malicious_jwt_insecure.ft_encode();
	const	[_header, _payload, signature_oauth] = token_encoded.split(".");
	const	malicious_jwt_signed = malicious_encoded + signature_oauth;
	/*To try malicious replace token: malicious_jwt_signed and private_key_url: 
	* malicious_private_key_url.*/
	const	jwt_signature_client_token = new JwtSignature({
		header: {typ: "JWT"},
		payload: {
			hola: "mundo",
			token: token_encoded
		},
		private_key_url: "./test/credentials_client/private_key_client"
	});
	await jwt_signature_client_token.ft_build();
	try {
		const	oauth_public_key = await FileModule.readFile("./test/credentials_oauth/public_key_oauth", {
			encoding: "utf8"
		});
		const	is_valid = await JwtSignature.ft_verifySegfaultxToken(await jwt_signature_client_token.ft_encode(), oauth_public_key);
		console.log(is_valid);
	}
	catch (err) {
		console.log(err);
		return ;
	}
})();
