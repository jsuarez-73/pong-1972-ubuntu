const	GATEWAY_PORT_HTTP = parseInt(process.env.GATEWAY_PORT_HTTP ?? "2998");
const	GATEWAY_PORT_HTTPS = parseInt(process.env.GATEWAY_PORT_HTTPS ?? "2999");
export const	CONSTANTS = {
	PORT_HTTP:  GATEWAY_PORT_HTTP,
	PORT_HTTPS: GATEWAY_PORT_HTTPS,
	VERSION_API: "v1",
	SHARED_FOLDER: process.env.SHARED_FOLDER ?? "../../shared",
	LOCATION_REDIRECTION: process.env.DEBUG ? `https://localhost:${GATEWAY_PORT_HTTPS}` : "https://localhost"
}
