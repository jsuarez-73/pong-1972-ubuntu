import { e_TYPE_MESSAGE } from "@game-types/enums";

export abstract class	AbstractBuildMessage {

	protected type: e_TYPE_MESSAGE;

	constructor (type: e_TYPE_MESSAGE) {
		this.type = type;
	}

	protected abstract	ft_buildMessage() : MessageGame;
}
