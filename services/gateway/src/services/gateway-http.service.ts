import { PluginRegister } from "@core/components/services";
import { CONSTANTS } from "@core/constants/constants";
import { GatewayServer } from "@services/server";

export class GatewayHttpService extends GatewayServer {
	private	static	game_service: GatewayHttpService | null = null;
	protected		plugins?: PluginRegister = undefined;
	protected		routes: Routes[] = [{
		method: "GET",
		url: "*",
		handler: (req: any, rep: any) => this.ft_redirectToHttps(req, rep)
	},
	{
		method: "POST",
		url: "*",
		handler: (req: any, rep: any) => this.ft_redirectToHttps(req, rep)
	},{
		method: "PUT",
		url: "*",
		handler: (req: any, rep: any) => this.ft_redirectToHttps(req, rep)
	},{
		method: "DELETE",
		url: "*",
		handler: (req: any, rep: any) => this.ft_redirectToHttps(req, rep)
	},{
		method: "OPTIONS",
		url: "*",
		handler: (req: any, rep: any) => this.ft_redirectToHttps(req, rep)
	},{
		method: "TRACE",
		url: "*",
		handler: (req: any, rep: any) => this.ft_redirectToHttps(req, rep)
	},{
		method: "PATCH",
		url: "*",
		handler: (req: any, rep: any) => this.ft_redirectToHttps(req, rep)
	}];
	protected		config: FastifyConfig = {
		logger: true,
		port: CONSTANTS.PORT_HTTP
	};

	constructor () {
		super();
		if (GatewayHttpService.game_service)
			return (this);
		GatewayHttpService.game_service = this;
		this.ft_startServer();
	}

	private	ft_redirectToHttps(req: any, rep: any): void {
		rep.statusCode = 301;
		rep.headers({
			location: `${CONSTANTS.LOCATION_REDIRECTION}${req.url}`
		})
		rep.send();
	}
}
