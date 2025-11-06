import fs from "node:fs/promises";
import path from "node:path";

const	client_id =  "409116011161-ebf5blfces8od3vkiao4tuan8dk3qb4b.apps.googleusercontent.com";
export const	CONSTANTS = {
	 OAUTH_PORT: `${process.env.OAUTH_PORT ?? 3001}`,
	 OAUTH_HOST: `${process.env.OAUTH_HOSTNAME ?? "localhost"}`,
	 CLIENT_ID: `${process.env.CLIENT_ID ?? client_id}`,
	 API_VERSION: `${process.env.APP_VERSION ?? "v1"}`,
 }
 export const	DOMAINS = {
	 OAUTH_DOMAIN: `http://${CONSTANTS.OAUTH_HOST}:${CONSTANTS.OAUTH_PORT}`
 }
 export const	SERVICES = {
	 signin: `${DOMAINS.OAUTH_DOMAIN}/${CONSTANTS.API_VERSION}/signin`,
	 access: `${DOMAINS.OAUTH_DOMAIN}/${CONSTANTS.API_VERSION}/access`,
	 callback: `${DOMAINS.OAUTH_DOMAIN}/${CONSTANTS.API_VERSION}/callback`,
 }

export const	ENVIRONMENT = {
	CONSTANTS: CONSTANTS,
	DOMAINS: DOMAINS,
	SERVICES: SERVICES
}

async function	ft_generate_env() {
	const	out = path.join("src/app/constants/constants.gen.json");
	const	env = JSON.stringify(ENVIRONMENT);
	const	fd = await fs.open(out, "w");
	const	res = await fd.write(env);
	if (res.bytesWritten == env.length)
		return (console.info("Generation successfull."));
	return (console.warn("Can't be generated the constatns file."));
}

ft_generate_env();
