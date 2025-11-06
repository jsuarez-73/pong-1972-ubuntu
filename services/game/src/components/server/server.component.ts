import	Fastify from "fastify";
import  websocket  from "@fastify/websocket";
import  process  from "node:process";
import { CONSTANTS } from "@core/constants/constants";

export abstract class GameServer {

	protected				fastify : Fastify = Fastify;
	protected	abstract	routes: Routes[];
	private	static			game_server: GameServer | null = null;
	private					is_listen: boolean = false;

	constructor () {
		if (GameServer.game_server)
			return (this);
		GameServer.game_server = this;
	}

	public	ft_startServer(): void {
		this.ft_initServer();
		this.ft_registerPlugins();
		this.ft_registerRoutes();
		this.ft_listen();
	}

	private	ft_initServer() : void {
		this.fastify = Fastify({
			logger: true,
		});
	}

	private	ft_registerPlugins() : void {
		this.fastify.register(websocket);
	}

	protected	ft_registerRoutes() : void {
		if (this.routes !== undefined && this.routes.length > 0) {
			this.fastify.register(() => {
				this.routes.forEach((route: Routes) => {
					this.fastify.route(route);
				});
			});
		}
	}

	protected ft_listen(config?: ConfigGameServer) {
		if (!config)
			config = {port: CONSTANTS.PORT, host: process.env.HOSTNAME ?? "localhost"};
		this.fastify.listen(config, (err: unknown) => {
			if (err) {
				this.fastify.log.error(err);
				process.exit(1);
			}
			this.is_listen = true;
		});
	}

	protected	ft_stopServer () : void {
		this.fastify.log.info("Closing Server");
		process.exit(0);
	}

	public	ft_isListen() : boolean {
		return (this.is_listen);
	}
}

