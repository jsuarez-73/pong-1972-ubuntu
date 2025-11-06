import { CONSTANTS } from "@constants/constants";
import Fastify from "fastify";
import process from "node:process";
import { PluginRegister } from "@core/components/services";

export abstract class GatewayServer {

	protected fastify: Fastify = Fastify;
	private is_listen: boolean = false;
	protected abstract config: FastifyConfig;
	protected abstract plugins?: PluginRegister;
	protected routes?: Routes[];

	constructor() {
	}

	public ft_startServer(): void {
		this.ft_initServer();
		this.ft_registerPlugins();
		this.ft_registerRoutes();
		this.ft_listen();
	}

	private ft_initServer(): void {
		this.fastify = Fastify(this.config);
	}

	/*[PENDING][PINNED][URGENT]: Make sure the game is the service from outside
	* but the gateway translate it to the service inside... this is:
		* game/v1/game/id --> v1/game/id*/
	/*[PENDING]: Avoid the user can get into the game url.
		* [UPDATE]: HAs been implemented the new way but not tested yet.*/
	private ft_registerPlugins(): void {
		if (this.plugins != undefined) {
			this.plugins.ft_registerPlugins(this.fastify);
		}
	}

	protected ft_registerRoutes(): void {
		if (this.routes != undefined && this.routes.length > 0) {
			this.fastify.register(async () => {
				this.routes?.forEach((route: Routes) => {
					this.fastify.route(route);
				});
			});
		}
	}

	protected ft_listen() {
		const config = { port: this.config.port, host: process.env.GATEWAY_HOSTNAME ?? "localhost" };
		this.fastify.listen(config, (err: unknown) => {
			if (err) {
				this.fastify.log.error(err);
				process.exit(1);
			}
			this.is_listen = true;
		});
	}

	protected ft_stopServer(): void {
		this.fastify.log.info("Closing Server");
		process.exit(0);
	}

	public ft_isListen(): boolean {
		return (this.is_listen);
	}
}

