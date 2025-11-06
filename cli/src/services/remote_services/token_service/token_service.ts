import { CONSTANTS } from "@constants/constants";
import { Http, IncomingMsg } from "@segfaultx/http";
import queryString	from "node:querystring";
import REGISTRATION from "@assets/register/registration.g.json";
import { Provider } from "@services/provider/provider";
import { JwtSignature } from "@segfaultx/jwt";

export	class TokenRemoteService {
	private	http: Http = new Http();
	private	jws: JwtSignature = new JwtSignature({
		private_key_url: CONSTANTS.pvk_url,
		public_key_url: CONSTANTS.pbk_url
	});
	private	instance?: TokenRemoteService;
	private	is_built: Promise<boolean> = Promise.resolve(false);

	constructor () {
		if (this.instance == undefined) {
			this.is_built = this.jws.ft_build();
			this.instance = this;
		}
		return (this.instance);
	}

	public	ft_requestTokenService(cred: CliCred): Promise<IncomingMsg | undefined> {
		return (this.is_built.then((is_built) => {
			if (! is_built) return (undefined);
			return (this.http.ft_post(
				CONSTANTS.token_ep,
				{
					headers: {
						"Content-type": "application/x-www-form-urlencoded",
						"Accept": "application/json"
					},
					data: queryString.encode({
						grant_type: "password",
						client_id: REGISTRATION.client_id,
						username: cred.username,
						password: cred.password
					})
			}).then(async (res) => {
				if (res.http.statusCode == 200) {
					try {
						const	token = JSON.parse(res.data.toString()).token;
						this.jws.payload = {token: token};
						const	signed_token = await this.jws.ft_encode();
						Provider.getInstance().set(
							"token",
							signed_token
						);
					}
					catch (e) {
						return (undefined);
					}
				}
				return (res);
			}).catch(() => {
				return (undefined);
			}));
		}));
	}
}
