import { TokenRemoteService } from "@services/remote_services/token_service/token_service";

export class	ModelLoginService implements ModelService {
	
	public	async	ft_getToken(cred: CliCred): Promise<string | undefined> {
		if (cred.username == undefined || cred.password == undefined)
			return (undefined);
		const	token_service = new TokenRemoteService();
		const	token = await token_service.ft_requestTokenService(cred)
			.then((res) => {
				switch (res?.http.statusCode) {
					case	200:
						try {
							return (JSON.parse(res.data.toString()).token);
						}
						catch (e) {}
					default:
						return (undefined);
				}
			});
		return (token);
	}
	/*[PENDING]: After get token and before go to dashboard must bring
	* all data from services: username, challenges availables, etc.*/
}
