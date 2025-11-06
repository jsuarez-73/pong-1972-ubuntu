import { WebSocket } from "@fastify/websocket";
import { Observer, Subject } from "@segfaultx/observable";
import { isStateRequestMsg, isStatusRequestMsg } from "@game-types/assertions";
import { ErrorResponse } from "../message/error.component";
import { e_ERROR_RESPONSE, e_TAG_PLAYER } from "@game-types/enums";
import { CloseRequestMsg } from "../message/close.component";

export class	Player implements SubjectEmitter<MessageGame>, SubjectObserver<MessageGame> {

	private	socket: WebSocket | undefined;
	private	tag: e_TAG_PLAYER;
	private	observer: Observer<MessageGame>; 
	private	isReady: boolean = false;

	constructor (tag: TagPlayer) {
		this.tag = tag;
		this.observer = new Observer<MessageGame>((state) => {
			this.ft_updateGlobalState(state);
		});
	}

	private	ft_updateGlobalState(msg: MessageGame) : void {
		if (this.socket?.readyState === WebSocket.OPEN) {
			Object.assign(msg, {tag: this.tag});
			this.socket?.send(JSON.stringify(msg));
		}
	}

	public	ft_unsetPlayer() : void {
		this.isReady = false;
		(this.observer.ft_getSubscription())?.unsubscribe();
	}

	public	ft_setSocket(socket: WebSocket) {
		this.socket = socket;
		this.isReady = true;
	}

	public	ft_getIsReady() : boolean {
		return (this.isReady);
	}

	public	ft_setIsReady(is_ready: boolean): Player {
		this.isReady = is_ready;
		return (this);
	}

	public	ft_getObserver() : Observer<MessageGame> {
		return (this.observer);
	}

	public	ft_getTag() : TagPlayer {
		return (this.tag);
	}

	public	ft_disposeSocket(): void {
		this.socket?.close();
	}

	public	ft_setEmitter (msg_request: Subject<MessageGame>) : void {
		this.socket?.on("message", (msg: any) => {
			try {
				let	msg_game = JSON.parse(msg.toString());
				if (! isStateRequestMsg(msg_game) && ! isStatusRequestMsg(msg_game)) {
					const	error = new ErrorResponse(e_ERROR_RESPONSE.MALFORMED_MSG);
					this.socket?.send(JSON.stringify(error.ft_buildMessage()));
					return ;
				}
				Object.assign(msg_game, {tag: this.tag});
				msg_request.ft_notify(msg_game);
			}
			catch (err: unknown) {
				console.log(`[ERROR]: ${err}`);
			}
		});
		this.socket?.on("close", (msg: {code: number, reason: string}) => {
			this.socket?.close();
			this.ft_unsetPlayer();
			const	close_msg = new CloseRequestMsg(msg.code, msg.reason, this.tag);
			msg_request.ft_notifyError(close_msg);
		});
	}
}
