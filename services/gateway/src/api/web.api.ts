import { ServiceApi } from "@core/api/service-api";

export class WebApi extends ServiceApi {
	private port = process.env.WEB_PORT ?? 4200;
	private host = process.env.WEB_HOSTNAME ?? "localhost";
	private host_outbound = `${this.host}:${this.port}`;

	public ft_buildService(fastify: Fastify): void {
		fastify.register(this.Proxy, {
			upstream: `http://${this.host_outbound}`,
			prefix: "/",
			rewritePrefix: "/",
			websocket: true
		});
	}
}
