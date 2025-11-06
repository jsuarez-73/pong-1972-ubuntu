export const	ROOT = process.env.FOLDER ?? "./";
export	const	CONSTANTS = {
	pbk_url: process.env.PUBLIC_KEY_URL ?? `${ROOT}/assets/keys/cli_rsa.pub`,
	pvk_url: process.env.PRIVATE_KEY_URL ?? `${ROOT}/assets/keys/cli_rsa.priv`,
	redirection_uri: process.env.REDIRECTION_URI ?? `http://localhost:3003/callback`,
	register_uri: process.env.REGISTER_URI ?? `http://localhost:3001/v1/register`,
	register_json: process.env.REGISTER_JSON ?? `${ROOT}/assets/register`,
	token_ep: process.env.TOKEN_EP?? `http://localhost:3001/v1/token`,
};
