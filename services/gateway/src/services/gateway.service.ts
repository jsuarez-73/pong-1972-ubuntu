import { GatewayServer } from "@services/server";
import	fs from "node:fs";
import { CONSTANTS } from "@core/constants/constants";
import { PluginRegister } from "@core/components/services";
import { OauthApi } from "@core/api/oauth.api";
import { WebApi } from "@core/api/web.api";
import { GameApi } from "@core/api/game.api";

export class GatewayService extends GatewayServer {
	private	static	gateway_service: GatewayService | null = null;
	protected		plugins: PluginRegister = new PluginRegister();
	protected		config: FastifyConfig = {
		logger: true,
		https: {
			key: fs.readFileSync(`${CONSTANTS.SHARED_FOLDER}/segfaultx_service.priv`),
			cert: fs.readFileSync(`${CONSTANTS.SHARED_FOLDER}/segfaultx_service.cert.pem`)
		},
		port: CONSTANTS.PORT_HTTPS
	}

	constructor () {
		super();
		if (GatewayService.gateway_service)
			return (this);
		GatewayService.gateway_service = this;
		this.plugins.ft_setServiceApi(
			new OauthApi(),
			new GameApi(),
			new WebApi()
		);
		this.ft_startServer();
	}
}
