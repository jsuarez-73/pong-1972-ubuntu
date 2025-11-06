export const	CONSTANTS = {
	UD_PORT: process.env.USER_DATA_PORT ?? 3002,
	UD_HOST: process.env.USER_DATA_HOSTNAME ?? "localhost",
	INDEX_FILE: "index.csr.html",
	ERROR_PAGE: "index.csr.html",
	COOKIE_SECRET: process.env.SECRET_COOKIE ?? "segfaultx_secret",
	BROWSER_DIR:  "../../oauth-www/dist/oauth-www/browser",
	WEB_CLIENT_ID: process.env.WEB_CLIENT_ID ?? "409116011161-ebf5blfces8od3vkiao4tuan8dk3qb4b.apps.googleusercontent.com",
	PORT:  parseInt(process.env.OAUTH_PORT ?? "3001"),
	PORT_OAUTH_WEB: parseInt(process.env.OAUTH_PORT_WEB ?? "4200"),
	HOSTNAME: process.env.HOSTNAME ?? "localhost",
	VERSION_API: "/v1",
	SHARED_FOLDER: process.env.SHARED_FOLDER ?? "../../shared",
	PRIVATE_KEY: "segfaultx_service.priv",
	PUBLIC_KEY: "segfaultx_service.pub",
	SCHEMA: {
		REGISTER: {
			body: {
				type: "object",
				properties: {
					client_type: {
						type: "string",
						pattern: "(^confidential$|^public$)"
					},
					redirection_uri: {type: "string"},
					public_key: {
						type: "object",
						properties: {
							kty: {type: "string", pattern: "^RSA$"},
							n: {type: "string"},
							e: {type: "string"}
						},
						required: ["kty", "n", "e"]
					}
				},
				required: ["client_type", "redirection_uri", "public_key"]
			}
		},
		AUTH: {
			query: {
				type: "object",
				properties: {
					client_id: {type: "string"},
					response_type: {type: "string", pattern: "^code$"},
					state: {type: "string", minLength: 3}
				},
				required: ["client_id", "response_type", "state"]
			}
		},
		SIGNIN: {
			body: {
				type: "object",
				properties: {
					credential: {
						type: "object",
						properties: {
							email: {type: "string"},
							password: {type: "string"}
						},
						required: ["email", "password"]
					}
				},
				required: ["credential"]
			}
		},
		AUTHORIZATION: {
			body: {
				type: "object",
				properties: {
					access: {type: "string"}
				},
				required: ["access"]
			}
		}
	}
};

export const	SERVICES = {
	register: `${CONSTANTS.VERSION_API}/register`,
	auth:  `${CONSTANTS.VERSION_API}/auth`,
	token: `${CONSTANTS.VERSION_API}/token`,
	callback: `${CONSTANTS.VERSION_API}/callback`,
	redirect_owner: `${CONSTANTS.VERSION_API}/authorization`,
	response_owner: `${CONSTANTS.VERSION_API}/access`,
	signin: `${CONSTANTS.VERSION_API}/signin`,
	gsi_receiver: `${CONSTANTS.VERSION_API}/gsi_receiver`,
};
