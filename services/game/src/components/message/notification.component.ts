import { AbstractBuildMessage } from "@components/message/abstract-message.component";
import { Observer, Subject } from "@segfaultx/observable";
import { e_GAME_CONSTANTS, e_GAME_STATE, e_PLAYER_STATE, e_TAG_PLAYER, e_TYPE_MESSAGE } from "@game-types/enums";
import { PlayerState } from "@core/components/player-state/player-state.component";

export class Notification extends AbstractBuildMessage {
	private	status: e_GAME_STATE = e_GAME_STATE.UNKNOWN;
	private	payload: NotificationPayload = {
		p1: e_PLAYER_STATE.WAIT,
		p2: e_PLAYER_STATE.WAIT,
		countdown_finish: false
	};
	private	change_state_subject: Subject<StateNotificationMsg> = new Subject();
	private	counter_down = {counter: e_GAME_CONSTANTS.COUNTER_START};
	private	counter_finish = {counter: e_GAME_CONSTANTS.COUNTER_FINISH};
	private	is_halt: boolean = false;
	private	winner: e_TAG_PLAYER | undefined;
	private	losers: e_TAG_PLAYER[] | undefined;
	private	players: PlayerState[] = [];

	constructor (players?: PlayerState[]) {
		super(e_TYPE_MESSAGE.NOTIFICATION);
		if (players !== undefined && players.length > 0)
			this.players.push(...players);
	}

	public	ft_setCounterFinish(counter_finish: number) {
		this.counter_finish.counter = counter_finish;
	}

	private	ft_setStatus(status: e_GAME_STATE, quiet?: boolean) : Notification {
		this.status = status;
		if (quiet === undefined || ! quiet)
			this.change_state_subject.ft_notify(this.ft_buildMessage());
		return (this);
	}

	public	ft_getStatus() : e_GAME_STATE {
		return (this.status);
	}

	public	ft_isHalt(): boolean {
		return (this.is_halt);
	}

	public	ft_isCountingDownToFinish(): boolean {
		return (this.payload.countdown_finish);
	}

	public	ft_setPlayerPayload(player_state: e_PLAYER_STATE, tag: e_TAG_PLAYER): Notification {
		this.payload.p1 = tag === e_TAG_PLAYER.ONE ? player_state : this.payload.p1;
		this.payload.p2 = tag === e_TAG_PLAYER.TWO ? player_state : this.payload.p2;
		let	change_state = this.payload.p1 === e_PLAYER_STATE.READY;
		change_state = change_state && this.payload.p2 === e_PLAYER_STATE.READY;
		if (change_state && this.status === e_GAME_STATE.START) {
			this.payload.countdown_finish = false;
			this.ft_setStatus(e_GAME_STATE.COUNTDOWN, true);
			this.ft_countDownStart();
		}
		return (this);
	}

	private	ft_countDownStart(): void {
		this.ft_countDown(this.counter_down, () => this.payload.countdown_finish).then((finished) => {
			if (finished)
				this.ft_setStatus(e_GAME_STATE.READY);
		});
	}

	private	ft_setPlayerStatus(tag: e_TAG_PLAYER, status: e_PLAYER_STATE): void {
		switch (tag) {
			case e_TAG_PLAYER.ONE:
				this.payload.p1 = status;
				break ;
			case e_TAG_PLAYER.TWO:
				this.payload.p2 = status;
				break ;
		}
	}

	public ft_halt(tag?: e_TAG_PLAYER): Notification {
		this.is_halt = true;
		if (tag !== undefined)
			this.ft_setPlayerStatus(tag, e_PLAYER_STATE.WAIT);
		if (! this.payload.countdown_finish)
			this.ft_countDownFinish();
		return (this);
	}

	private async	ft_countDown(start: {counter: number}, is_halt: Function): Promise<boolean> {
		for (; start.counter >= 0; start.counter--) {
			if (await (new Promise((res) => {
				if (! is_halt())
					this.change_state_subject.ft_notify(this.ft_buildMessage());
				setTimeout(() => {
					res(is_halt());
				}, 1000);
			})))
				return (false);
		}
		return (true);
	}

	private async	ft_countDownFinish(): Promise<void> {
		this.payload.countdown_finish = true;
		const	is_finished = await this.ft_countDown(this.counter_finish, () => ! this.payload.countdown_finish);
		this.payload.countdown_finish = false;
		if (is_finished) {
			this.ft_finish();
		}
		else
			this.counter_finish = {counter: e_GAME_CONSTANTS.COUNTER_FINISH};
	}

	public	ft_statusStart(): Notification {
		this.ft_setStatus(e_GAME_STATE.START);
		this.ft_countDownFinish();
		return (this);
	}

	public	ft_rush(tag: e_TAG_PLAYER): Notification {
		this.is_halt = false;
		this.ft_setPlayerStatus(tag, e_PLAYER_STATE.READY);
		if (this.status === e_GAME_STATE.COUNTDOWN)
			this.ft_countDownStart();
		if (this.status !== e_GAME_STATE.START) {
			this.payload.countdown_finish = false;
			this.change_state_subject.ft_notify(this.ft_buildMessage());
		}
		return (this);
	}

	public	ft_finish(): Notification {
		const	score_one = this.players[e_TAG_PLAYER.ONE].score;
		const	score_two = this.players[e_TAG_PLAYER.TWO].score;
		if (score_one === score_two) {
			if (this.payload.p1 === e_PLAYER_STATE.WAIT &&
				this.payload.p2 === e_PLAYER_STATE.WAIT) {
				this.losers = [e_TAG_PLAYER.ONE, e_TAG_PLAYER.TWO];
			}
			else if (this.payload.p1 === e_PLAYER_STATE.WAIT) {
				this.winner = e_TAG_PLAYER.TWO;
				this.losers = [e_TAG_PLAYER.ONE]
			}
			else if (this.payload.p2 === e_PLAYER_STATE.WAIT) {
				this.winner = e_TAG_PLAYER.ONE;
				this.losers = [e_TAG_PLAYER.TWO];
			}
		}
		else {
			this.winner = (score_one > score_two) ?  e_TAG_PLAYER.ONE : e_TAG_PLAYER.TWO;
			this.losers = (score_one < score_two) ? [e_TAG_PLAYER.ONE] : [e_TAG_PLAYER.TWO];
		}
		this.ft_setStatus(e_GAME_STATE.FINISH);
		return (this);
	}
	
	private	ft_buildPayload(): NotificationPayload {
		if (this.payload.countdown_finish)
			return ({...this.payload, ...this.counter_finish});
		else if (this.status === e_GAME_STATE.COUNTDOWN)
			return ({...this.payload, ...this.counter_down});
		else if (this.status === e_GAME_STATE.FINISH && this.losers !== undefined)
			return ({...this.payload, winner: this.winner, losers: this.losers});
		return (this.payload);
	}

	public	ft_buildMessage(): StateNotificationMsg {
	    return ({
			type: this.type,
			body: {
				status: this.status,
				payload: this.ft_buildPayload()
			}
		});
	}

	public	ft_subscribeToChangeState(ob: Observer<StateNotificationMsg>) : Notification {
		this.change_state_subject.ft_subscribe(ob);
		return (this);
	}
}
