import { GlobalState } from "@components/state/state.component";
import { Subject, Observer } from "@segfaultx/observable";
import { CloseRequestMsg } from "@components/message/close.component";
import { e_GAME_STATE, e_TAG_PLAYER, e_TYPE_MESSAGE } from "@game-types/enums";

export	class Referee implements SubjectEmitter<MessageGame>, SubjectObserver<MessageGame>{

	private	observer_players: Observer<MessageGame>;
	private	global_state : GlobalState = new GlobalState();
	private	msg_response: Subject<MessageGame> | null = null;
	private	disposal_game: (() => void) = () => {};
	private	observer_msgs: Observer<MessageGame>;

	constructor () {
		this.observer_players = new Observer<MessageGame>((msg) => {
			this.ft_incommingMessageGame(msg);
			
		}, (msg_close) => {
			this.ft_incommingCloseRequest(msg_close);
		});

		this.observer_msgs = new Observer<MessageGame>((msg) => {
			this.msg_response?.ft_notify(msg);
			if (msg.type === e_TYPE_MESSAGE.NOTIFICATION && 
				msg.body.status === e_GAME_STATE.FINISH)
				this.disposal_game();
		});
		this.global_state.ft_subscribeToGlobalStateMsg(this.observer_msgs);
	}

	/*[!PENDING]: When a ball is scored must wait 2 seconds without send any message,
	* however, when the player move the racquet a message is sent with the next
	* state, but just the next one. [FIX IT]*/
	private	ft_incommingMessageGame(msg: MessageGame) {
		switch (msg.type) {
			case e_TYPE_MESSAGE.STATUS_REQUEST:
				this.global_state.ft_setPlayerStatus(msg.body.status, msg.tag);
				break ;
			case e_TYPE_MESSAGE.STATE_REQUEST:
				this.global_state.ft_commitPlayerState(msg.body.player, msg.tag);
				break ;
		}
	}

	private	ft_incommingCloseRequest(msg: CloseRequestMsg) {
		this.global_state.ft_PlayerGoingOut(msg.ft_getTag());
	}

	public	ft_getObserver() : Observer<MessageGame> {
		return (this.observer_players);
	}

	public	ft_setEmitter(subject: Subject<MessageGame>): void {
	    this.msg_response = subject;
	}

	public	ft_addPlayerUp(tag: e_TAG_PLAYER): void {
		this.global_state.ft_PlayerCommingIn(tag);
	}

	/*[!TODO]: Verify when the game is done, the disposal goes as expected.
		* */
	public	ft_setDisposalGame(disposal: () => void): void {
		this.disposal_game = disposal;
	}
}
