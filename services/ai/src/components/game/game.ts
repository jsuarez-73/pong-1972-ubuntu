import { Rank, Tensor, TensorBuffer } from "@tensorflow/tfjs-node";
import * as Tf from "@tensorflow/tfjs-node";
import { e_GAME_CONSTANTS, e_TAG_PLAYER, e_TYPE_MESSAGE } from "@constants/constants";
import { BallState, e_GAME_CHANNEL, e_GAME_STATE, PlayerState, StateNotificationMsg, StateResponseMsg } from "@ai-types/t_game";
import { MessageGame } from "@ai-types/t_game";
import { Observer } from "@segfaultx/observable";

export class	PongGame {

	private	_url: string = "";
	private	last_message: void | Promise<void> = undefined;
	private	listener: Observer<{is_done: boolean, tag: e_TAG_PLAYER}> | undefined;

	get	hsquares() {return (30)}
	get	vsquares() {return (30)}
	get	channels() {return (3)}
	set	url(url: string) {
		/*[PENDING]: Set properly the regex.*/
		if (url.length == 0)//if (/https?:\/\/.*/.test(url))
			throw (new Error("Must be defined an url"));
		this._url = url;
	}

	constructor (url: string) {
		this.url = url;
	}

	private	ft_setAbsolutePositions(position: {pos_x?: number, pos_y?: number}[]): void {
		position.forEach(position => {
			if (position.pos_x != undefined)
				position.pos_x = e_GAME_CONSTANTS.WIDTH / 2 + position.pos_x;
			if (position.pos_y != undefined)
				position.pos_y = e_GAME_CONSTANTS.HEIGHT / 2 - position.pos_y;
		});
	}

	public	ft_reset(): void {
		this.last_message = undefined;
	}

	private	ft_fillPlayerOnDiscreteState(buf_racquet: TensorBuffer<Rank, "float32">,
										 player: PlayerState, index: number): void {
		const	hratio = this.vsquares / e_GAME_CONSTANTS.HEIGHT;
		const	center = Math.floor(player.pos_y * hratio);
		const	half_racquet = Math.round((e_GAME_CONSTANTS.HALF_RACQUET * hratio));
		let		rq_start = center - half_racquet;
		rq_start = rq_start < 0 ? 0 : rq_start;
		let		rq_end = center + half_racquet;
		rq_end = rq_end > (this.vsquares - 1) ? this.vsquares : rq_end;
		for (;rq_start <= rq_end; rq_start++) {
			switch (player.tag) {
				case e_TAG_PLAYER.ONE: 
					buf_racquet.set(index + 1, 0, rq_start, 0, e_GAME_CHANNEL.RONE_CH);
					break ;
				case e_TAG_PLAYER.TWO:
					const	pos_x = this.hsquares - 1;
					buf_racquet.set(index + 1, 0, rq_start, pos_x, e_GAME_CHANNEL.RTWO_CH);
					break ;
				default:
					return ;
			}
		}
	}

	/*[PENDING]: Test if this implementation to Array is well implemented.*/
	public	ft_getStateTensor(state: StateResponseMsg[]): Tensor {
		const	buffer = Tf.buffer([state.length, this.vsquares, this.hsquares, this.channels]);
		state.forEach((state, index) => {
			const	ball: BallState = state.body.ball; 
			const	players: PlayerState[] = state.body.players;
			const	hratio = (this.hsquares - 1) / e_GAME_CONSTANTS.WIDTH;
			const	vratio = (this.vsquares - 1) / e_GAME_CONSTANTS.HEIGHT;
			this.ft_setAbsolutePositions([ball]);
			this.ft_setAbsolutePositions(players);
			const	cx_square = Math.floor(ball.pos_x * hratio);
			const	cy_square = Math.floor(ball.pos_y * vratio);
			buffer.set(index + 1, 0, cy_square, cx_square, e_GAME_CHANNEL.BALL_CH);
			this.ft_fillPlayerOnDiscreteState(buffer, players[e_TAG_PLAYER.ONE]!, index);
			this.ft_fillPlayerOnDiscreteState(buffer, players[e_TAG_PLAYER.TWO]!, index);
		});
		return (buffer.toTensor());
	}

	public	ft_subscribeToSocket(ob: Observer<MessageGame>) : WebSocket | undefined {
		/*[!PENDING]: How to handle errors from initialization.*/
		/*[!PENDING]: How to handle the other events*/
		try {
			const	socket = new WebSocket(this._url);
			socket.addEventListener("message", (ev: MessageEvent<any>) => {
				/*[!PENDING][!IMPORTANT]: What to do if the client can't read
				* messages from a network connection problem? I think the connection
				* is closed by the socket server and that will notify the other client
				* and also the server will stop.*/
				if (this.last_message === undefined) {
					this.last_message = ob.ft_update(JSON.parse(ev.data));
				}
				else {
					if (this.last_message instanceof Promise) {
						this.last_message = this.last_message.then(async () => {
							const	msg: MessageGame = JSON.parse(ev.data);
							await ob.ft_update(msg);
							if (msg.type == e_TYPE_MESSAGE.NOTIFICATION) {
								const	noti = msg as StateNotificationMsg;
								if (noti.body.status == e_GAME_STATE.FINISH)
									//await this.listener?.ft_update(true);
									await this.listener?.ft_update({
										is_done:true,
										tag: msg.tag
									});
							}
						});
					}
				}
			});
			return (socket);
		}
		catch (err: unknown) {
		}
		return (undefined);
	}

	public	ft_listenWhenDone(ob: Observer<{is_done: boolean, tag: e_TAG_PLAYER}>): void {
		this.listener = ob;
	}
}
