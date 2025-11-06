import { ServiceApi } from "@core/api/service-api";

export class	OauthApi extends ServiceApi {

	private	port = process.env.OAUTH_PORT ?? 3001
	private	host = process.env.OAUTH_HOSTNAME ?? "localhost";
	private	host_outbound = `${this.host}:${this.port}`;

	public ft_buildService(fastify: Fastify): void {
		fastify.register(this.Proxy, {
			upstream: `http://${this.host_outbound}`,
			prefix: "/oauth",
			websocket: true
		});
	}

}
