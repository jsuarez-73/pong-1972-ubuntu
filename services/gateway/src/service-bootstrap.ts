import { GatewayHttpService } from "./services/gateway-http.service";
import { GatewayService } from "./services/gateway.service";

function ft_boostrapService () {
	new GatewayHttpService();
	new GatewayService();
}
ft_boostrapService();
