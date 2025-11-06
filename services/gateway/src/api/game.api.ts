import { ServiceApi } from "@core/api/service-api";

export class GameApi extends ServiceApi {
	private port = process.env.GAME_PORT ?? 3000;
	private host = process.env.GAME_HOSTNAME ?? "localhost";
	private host_outbound = `${this.host}:${this.port}`;

	public ft_buildService(fastify: Fastify): void {
		fastify.register(this.Proxy, {
			upstream: `http://${this.host_outbound}`,
			prefix: "/game",
			websocket: true
		});
	}
}
