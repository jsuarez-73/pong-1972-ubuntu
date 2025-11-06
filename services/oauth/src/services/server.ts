import { CONSTANTS } from "@constants/constants";
import	MFastify  from "fastify";
import  process  from "node:process";
import	querystring from "node:querystring";
import { ConfigOauthServer, Routes, Fastify, OauthPlugin } from "@oauth-types/oauth";

export abstract class OauthServer {

	protected			fastify: Fastify;
	private				is_listen: boolean = false;
	protected abstract	routes: Routes[];
	protected abstract	plugins?: OauthPlugin[];

	constructor () {
	}

	public	ft_startServer(): void {
		this.ft_initServer();
		this.ft_registerPlugins();
		this.ft_registerRoutes();
		this.ft_listen();
	}

	private	ft_initServer() : void {
		this.fastify = MFastify({
			logger: true,
		});
		this.fastify.addContentTypeParser("application/x-www-form-urlencoded", this.formUrlEncodedParser);
	}

	private	formUrlEncodedParser(_request: any, payload: any, done: any) {
		let	body = ""; 
		payload.on("data", function (data: string) {
			body += data
		});
		payload.on("end", function () {
			try {
				const parsed = querystring.parse(body)
			  	done(null, parsed)
			} catch (e) {
				done(e)
			}
		});
		payload.on("error", done);
	}

	private	ft_registerPlugins() : void {
		if (this.plugins == undefined)
			return ;
		this.plugins.forEach(plugin => this.fastify.register(plugin.module, plugin.payload));
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

	protected ft_listen(config?: ConfigOauthServer) {
		if (!config)
			config = {port: CONSTANTS.PORT, host: CONSTANTS.HOSTNAME};
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

