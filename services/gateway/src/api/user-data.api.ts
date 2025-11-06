import { ServiceApi } from "@core/api/service-api";
/*[!PENDING]: The idea behind this implementation is through URI obtain a proper
* URI to send back the response, from JWT create a proper JWT from any Object
* that will be given back from the UserData Service.
	* [!UPDATED]: I don't need a URI because the HTTP protocol allow us when
* an request came up just send back a response through the same domain, in the 
* case Oauth framework is needed a redirect_uri because the response from the
* resource owner must be redirected to the client, saving this field by the oauth
* server allow it to send the response properly to the client who request it.
* We'll send the request with the token from the Oauth server*/
export class	UserDataApi extends ServiceApi {

	public ft_buildService(_fastify: Fastify): void {
	    
	}
}
