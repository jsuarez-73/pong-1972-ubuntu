import { ConfigRequest, Http, IncomingMsg } from "@segfaultx/http";
import { Provider } from "@services/provider/provider";

export class	HttpAuthService {
	private http: Http = new Http();

	private	ft_pushAuthorization(config?: ConfigRequest): ConfigRequest | undefined {
		let	config_decorated: ConfigRequest | undefined;
		const	token = Provider.getInstance().get("token");
		if (token == undefined)
			config_decorated = config;
		else
			config_decorated = {
				headers: {
					...config?.headers,
					"Authorization": token,
				}
			};
		return (config_decorated);
	}

	public	ft_post(url: string, config?: ConfigRequest): Promise<IncomingMsg> {
		config = this.ft_pushAuthorization(config);
		return (this.http.ft_post(url, config));
	}

	public	ft_get(url: string, config?: ConfigRequest): Promise<IncomingMsg> {
		config = this.ft_pushAuthorization(config);
		return (this.http.ft_get(url, config));
	}
}
