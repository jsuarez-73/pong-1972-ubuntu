import { AbstractBuildMessage } from "@components/message/abstract-message.component";
import { e_ERROR_RESPONSE, e_TYPE_MESSAGE } from "@game-types/enums";

export class	ErrorResponse extends AbstractBuildMessage {
	
	private			code: e_ERROR_RESPONSE;
	public static	map : Map<e_ERROR_RESPONSE, string> = new Map([
		[e_ERROR_RESPONSE.MALFORMED_MSG, "Malformed Message"]
	]);

	constructor (code: e_ERROR_RESPONSE)  {
		super(e_TYPE_MESSAGE.ERROR_RESPONSE);
		this.code = code;
	}

	public	ft_setCode(code: e_ERROR_RESPONSE): ErrorResponse {
		this.code = code;
		return (this);
	}

	public ft_buildMessage(): MessageGame {
	    return ({
			type: this.type,
			body: {
				code: this.code,
				msg: ErrorResponse.map.get(this.code)
			}
		});
	}
}
