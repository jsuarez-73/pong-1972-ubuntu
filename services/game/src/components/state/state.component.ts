import { StateResponse } from "@components/message/state-response.component";
import { e_ACTION, e_BALL_ACTION, e_GAME_CONSTANTS, e_GAME_STATE, e_PLAYER_STATE, e_TAG_PLAYER } from "@game-types/enums";
import { BallState } from "@components/ball-state/ball-state.component";
import { PlayerState } from "@components/player-state/player-state.component";
import { Notification } from "@components/message/notification.component";
import { BAUD_RATE, PARAMS, WAIT_SCORED_TIME } from "@components/params/params.component";
import { Subject, Observer } from "@segfaultx/observable";

export class GlobalState {
	/*[!PENDING]: The initial position where the ball go out is random. also
	* the velocity direction.*/
	protected ball: BallState = new BallState(PARAMS.ball_x_start, PARAMS.ball_y_start);
	protected players: PlayerState[] = [
		new PlayerState(e_TAG_PLAYER.ONE),
		new PlayerState(e_TAG_PLAYER.TWO)
	];
	protected players_online = 0;
	protected state_response: StateResponse = new StateResponse(this.ball, this.players);
	protected notification_status: Notification = new Notification(this.players);
	protected	last_scored = 0;
	protected	last_ball_action: e_BALL_ACTION = e_BALL_ACTION.MOVE;
	protected	observer_states: Observer<MessageGame>;
	protected	msg_game_subject: Subject<MessageGame> = new Subject();
	protected	timer: NodeJS.Timeout | undefined;
	protected	baud_rate: number = BAUD_RATE;
	protected	wait_scored_time: number = WAIT_SCORED_TIME;

	//[PENDING][URGENT]: Set a way to set the notification object the counter_start, counter_finish timers.
	constructor() {
		this.observer_states = new Observer<StateNotificationMsg>((state_msg) => {
			this.ft_handleStates(state_msg);
		});
		this.notification_status.ft_subscribeToChangeState(this.observer_states);
	}

	/*@return: e_BALL_ACTION.[SCORE_P1 | SCORE_P2 | BOUNCE],
	* when the return is a score type, this represent the player who
	* scored. This player add up a point.*/
	protected	ft_playerDiscriminant(player_state: PlayerState) : e_BALL_ACTION {
		let	scored : e_BALL_ACTION;
		const	ball_pos = this.ball.ft_getBallState();
		let	discriminant = Math.abs(ball_pos.pos_y - player_state.pos_y);
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


	public	ft_nextState() : e_BALL_ACTION {
		this.ball.ft_nextBallState();
		const	ball_pos = this.ball.ft_getBallState();
		const	upper_gap = Math.abs(ball_pos.pos_y - PARAMS.upper_bound);
		const	lower_gap = Math.abs(ball_pos.pos_y - PARAMS.lower_bound);

		if (Math.abs(ball_pos.pos_x - PARAMS.rigth_bound) <= PARAMS.epsilon) 
			return (this.ft_playerDiscriminant(this.players[e_TAG_PLAYER.TWO]));
		else if (Math.abs(ball_pos.pos_x - PARAMS.left_bound) <= PARAMS.epsilon) 
			return (this.ft_playerDiscriminant(this.players[e_TAG_PLAYER.ONE]));
		else if (upper_gap <= PARAMS.epsilon || lower_gap <= PARAMS.epsilon) {
			this.ball.vel_y *= -1;
			return (e_BALL_ACTION.BOUNCE);
		}
		return (e_BALL_ACTION.MOVE);
	}

	public	ft_nextGlobalState(): MessageGame {
		this.last_ball_action = this.ft_nextState();
		switch (this.last_ball_action) {
			case e_BALL_ACTION.SCORE_P1:
				this.players[e_TAG_PLAYER.ONE].score++;
				this.msg_game_subject.ft_notify(this.state_response.ft_buildMessage());
				if (this.players[e_TAG_PLAYER.ONE].score === PARAMS.points_to_win)
					this.notification_status.ft_finish();
				this.ft_resetInitialSetState();
				break ;
			case e_BALL_ACTION.SCORE_P2:
				this.players[e_TAG_PLAYER.TWO].score++;
				this.msg_game_subject.ft_notify(this.state_response.ft_buildMessage());
				if (this.players[e_TAG_PLAYER.TWO].score === PARAMS.points_to_win)
					this.notification_status.ft_finish();
				this.ft_resetInitialSetState();
				break ;
		}
		return (this.ft_getMessageResponse());
	}

	public	ft_getLastBallAction() : e_BALL_ACTION {
		return (this.last_ball_action);
	}

	public	ft_resetInitialSetState() : void {
		this.ball.ft_resetInitialState();
		this.ball.vel_x = this.last_scored === e_BALL_ACTION.SCORE_P2 ? -1 : 1;
		this.ball.vel_y = (Math.random() > 0.5 ? 1 : -1) * PARAMS.vel_y;
		this.players.forEach((player) => {
			player.pos_y = 0;
			player.action = e_ACTION.IDLE;
		});
	}

	public	ft_setPlayerStatus(status: e_PLAYER_STATE, tag: e_TAG_PLAYER): GlobalState {
		this.notification_status.ft_setPlayerPayload(status, tag);
		return (this);
	}

	public ft_commitPlayerState(player: PlayerState, tag: e_TAG_PLAYER): GlobalState {
		const	corner_up = this.players[tag].pos_y + e_GAME_CONSTANTS.HALF_RACQUET;
		const	corner_down = this.players[tag].pos_y - e_GAME_CONSTANTS.HALF_RACQUET;
		const	delta_up = PARAMS.upper_bound - corner_up;
		const	delta_lo = PARAMS.lower_bound - corner_down;
		switch (player.action) {
			case e_ACTION.UP: 
				if (delta_up >= PARAMS.steps_per_action)
					this.players[tag].pos_y += PARAMS.steps_per_action;
				else if (delta_up > 0)
					this.players[tag].pos_y += delta_up;
				break ;
			case e_ACTION.DOWN:
				if (delta_lo <= -PARAMS.steps_per_action)
					this.players[tag].pos_y -= PARAMS.steps_per_action;
				else if (delta_lo < 0)
					this.players[tag].pos_y += delta_lo;
				break ;
		}
		return (this);
	}

	public ft_PlayerCommingIn(tag: e_TAG_PLAYER): GlobalState {
		if (this.players_online <= 2)
			this.players_online++;
		if (this.players_online === 2) {
			if (this.notification_status.ft_isHalt())
				this.notification_status.ft_rush(tag);
			else if (! this.ft_hasFinished())
				this.notification_status.ft_statusStart();
		}
		return (this);
	}

	public ft_PlayerGoingOut(tag: e_TAG_PLAYER): GlobalState {
		if (this.players_online > 0)
			this.players_online--;
		if (! this.ft_hasFinished())
			this.notification_status.ft_halt(tag);
		return (this);
	}

	public ft_getMessageResponse(): MessageGame {
		if (! this.ft_isReady())
			return (this.notification_status.ft_buildMessage());
		else
			return (this.state_response.ft_buildMessage());
	}

	public	ft_isReady(): boolean {
		return (this.notification_status.ft_getStatus() === e_GAME_STATE.READY);
	}

	public	ft_hasFinished(): boolean {
		return (this.notification_status.ft_getStatus() === e_GAME_STATE.FINISH);
	}

	public	ft_getLastState() : MessageGame {
		return (this.state_response.ft_buildMessage());
	}

	protected	async ft_notifyStates(): Promise<void> {
		const	last_ball_state = this.ft_getLastBallAction();
		const	next_msg = this.ft_nextGlobalState();
		if (this.ft_hasFinished())
			return ;
		else if (last_ball_state === e_BALL_ACTION.SCORE_P1 || 
			last_ball_state === e_BALL_ACTION.SCORE_P2) {
			await (new Promise((res) => {
				setTimeout(() => {
					this.msg_game_subject.ft_notify(next_msg);
					res(true);	
				}, this.wait_scored_time);
			}));
		}
		else
			this.msg_game_subject.ft_notify(this.state_response.ft_buildMessage());
	}

	protected	ft_iterateStates() : void {
		this.timer = setTimeout(async () => {
			await this.ft_notifyStates();
			this.ft_iterateStates();
		}, this.baud_rate);
	}

	protected	ft_resetTimer(): void {
		if (this.timer !== undefined)
			clearTimeout(this.timer);
	}

	protected	ft_handleStates(state_msg: StateNotificationMsg): void {
		if (this.notification_status.ft_isCountingDownToFinish()) {
			this.msg_game_subject.ft_notify(state_msg);
			this.ft_resetTimer();
		}
		else {
			switch (state_msg.body.status) {
				case e_GAME_STATE.READY:
					this.msg_game_subject.ft_notify(state_msg);
					this.ft_iterateStates();
					break ;
				case e_GAME_STATE.FINISH:
					///*[FIXBUG][PENDING][PINNED]: Delivering the last_state twice.
					//Check cli if handle just once or twice this message.*/
					//this.msg_game_subject.ft_notify(this.ft_getLastState());
					//The cli received this one to update the last score, then
					//we must update cli to take that one from the last one.
					//this.msg_game_subject.ft_notify(this.ft_getLastState());
					this.msg_game_subject.ft_notify(state_msg);
					this.ft_resetTimer();
					break ;
				default:
					this.msg_game_subject.ft_notify(state_msg);
					this.ft_resetTimer();
			}
		}
	}

	public	ft_subscribeToGlobalStateMsg(ob: Observer<MessageGame>): GlobalState {
		this.msg_game_subject.ft_subscribe(ob);
		return (this);
	}
}
