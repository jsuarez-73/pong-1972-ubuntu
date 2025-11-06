import { AbstractBuildMessage } from "@components/message/abstract-message.component";
import { e_TAG_PLAYER, e_TYPE_MESSAGE } from "@game-types/enums";

export class	CloseRequestMsg extends AbstractBuildMessage {
	
	private	code: number;
	private	reason: string;
	private	tag: e_TAG_PLAYER;

	constructor(code: number = NaN, reason: string = "", tag: e_TAG_PLAYER) {
		super(e_TYPE_MESSAGE.CLOSE_REQUEST);
		this.code = code;
		this.reason = reason;
		this.tag = tag;
	}

	public	ft_getTag(): e_TAG_PLAYER {
		return (this.tag);
	}

	public	ft_setCode(code: number): CloseRequestMsg {
		this.code = code;
		return (this);
	}

	public	ft_setReason(reason: string): CloseRequestMsg {
		this.reason = reason;
		return (this);
	}

	public ft_buildMessage(): MessageGame {
	    return ({
			type: this.type,
			body: {
				code: this.code,
				reason: this.reason
			}
		});
	}
}
