import { JwtRsaPublicKey } from "@segfaultx/jwt";
import { CONSTANTS } from "../constants/constants";
import { Http } from "@segfaultx/http";
import fs from "node:fs/promises";
import	path from "node:path";
import { exit } from "node:process";

async function	ft_generateRegistration() {
	const	jwk = new JwtRsaPublicKey(CONSTANTS.pbk_url);
	const	http = new Http();
	let		register_file: fs.FileHandle;
	try {
		const	register_uri = path.normalize(CONSTANTS.register_json);
		register_file = await fs.open(`${register_uri}/registration.g.json`, "w");
	}
	catch (e) {
		console.error(`Failed to open/create ${CONSTANTS.register_json}`);
		exit(1);
	}
	if (! await jwk.ft_build())
		console.log("Something went wrong builting the JWK");
	const	json_pbk = jwk.ft_getJwk();
	const	registration_json = {
		client_type: "public",
		redirection_uri: CONSTANTS.redirection_uri,
		public_key: json_pbk
	};
	http.ft_post(CONSTANTS.register_uri, {
		headers: {
			"Content-type": "application/json",
			"Accept": "application/json"
		},
		data: registration_json
	}).then(async (res) => {
		try {
			await register_file.writeFile(res.data.toString());
		}
		catch (e) {
			console.error(`Failed to write on ${CONSTANTS.register_json}`);
			exit(1);
		}
	}).catch((error) => {
		console.error(`The request has failed with error: ${error}`);
		exit(1);
	});
}

ft_generateRegistration();
