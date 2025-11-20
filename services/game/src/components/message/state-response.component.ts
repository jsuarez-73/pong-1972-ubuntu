import { AbstractBuildMessage } from "@components/message/abstract-message.component";
import { e_TYPE_MESSAGE } from "@game-types/enums";
import { BallState } from "@components/ball-state/ball-state.component";
import { PlayerState } from "@components/player-state/player-state.component";

export class StateResponse extends AbstractBuildMessage {
	
	private	ball: BallState;
	private	players: PlayerState[];

	constructor(ball: BallState, players: PlayerState[]) {
		super(e_TYPE_MESSAGE.STATE_RESPONSE);
		this.ball = ball;
		this.players = players;
	}

	public	ft_setBall(ball: BallState) : StateResponse {
		this.ball = ball;
		return (this);
	}

	public	ft_setPlayers(players: PlayerState[]) : StateResponse {
		this.players = players;
		return (this);
	}

	public	ft_buildMessage(): MessageGame {
		return ({
			type: this.type,
			body: {
				ball: this.ball.ft_getBallState(),
				players: this.players
			}
		});
	}


}
