import { e_BALL_ACTION, e_GAME_STATE, e_PLAYER_STATE, e_TAG_PLAYER } from "@game-types/enums";
import { GlobalState } from "./state.component";
import { PARAMS } from "../params/params.component";
import { PlayerState } from "../player-state/player-state.component";

export class	GlobalStateTrain extends GlobalState {
	public	trainer: e_TAG_PLAYER | undefined;
	
	constructor () {
		super();
		this.notification_status.ft_setCounterFinish(Infinity);
	}

	protected	ft_playerDiscriminant(player_state: PlayerState) : e_BALL_ACTION {
		let	scored : e_BALL_ACTION;
		const	ball_pos = this.ball.ft_getBallPosition();
		let	discriminant;
		if (player_state.tag == this.trainer)
			discriminant = 0.1 - Math.random();
		else
			discriminant = Math.abs(ball_pos.pos_y - player_state.pos_y);
		if (player_state.tag === e_TAG_PLAYER.TWO)
			scored = e_BALL_ACTION.SCORE_P1;
		else
			scored = e_BALL_ACTION.SCORE_P2
		discriminant -= PARAMS.delta_y;
		if (discriminant < 0) {
			this.ball.vel_x *= -1;
			return (e_BALL_ACTION.BOUNCE);
		}
		this.last_scored = scored;
		return (scored);
	}

	protected async ft_iterateStates(): Promise<void> {
		await this.ft_notifyStates();
	}
	
	public ft_commitPlayerState(player: PlayerState, tag: e_TAG_PLAYER): GlobalState {
	    super.ft_commitPlayerState(player, tag);
		if (this.notification_status.ft_getStatus() == e_GAME_STATE.READY)
			this.ft_iterateStates();
		return (this);
	}

}
