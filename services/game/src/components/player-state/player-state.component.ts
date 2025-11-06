import { e_ACTION, e_TAG_PLAYER } from "@game-types/enums";

export	class	PlayerState {
	
	public	pos_y: number;
	public	action: e_ACTION;
	public	tag: e_TAG_PLAYER;
	public	score: number = 0;

	constructor (
		tag: e_TAG_PLAYER,
		pos_y: number = 0,
		action: e_ACTION = e_ACTION.IDLE,
	) {
		this.pos_y = pos_y;
		this.action = action;
		this.tag = tag;
	}
}
