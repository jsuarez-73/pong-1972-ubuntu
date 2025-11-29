import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as Tf from "@tensorflow/tfjs";
import { e_ACTION, e_GAME_CONSTANTS, e_GAME_STATE, e_PLAYER_STATE, e_TYPE_MESSAGE, MessageGame, NotificationMsg, PARAMS, PlayerState, StateResponseMsg } from '../types/t_testai';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
	protected readonly title = signal('test_ai');
	private	model?: Tf.LayersModel;
	private	socket?: WebSocket;
	private	url: string = "http://localhost:3000/v1/ai/1";
	private	fields: number = 8;

	public async	ft_loadModel(): Promise<void> {
		this.model = await Tf.loadLayersModel("http://localhost:3000/model.json");
		this.model.summary();
	}

    private	ft_normalizeState(state: StateResponseMsg): StateResponseMsg {
		// deep copy so we never modify the original message
        const	st = JSON.parse(JSON.stringify(state));
        const	vel_x = st["body"]["ball"]["vel_x"]
        const	vel_y = st["body"]["ball"]["vel_y"]
        let		vel_mg = Math.sqrt(vel_x * vel_x + vel_y * vel_y)
        if (vel_mg == 0)
            vel_mg = 1.0

        //Normalize ball position
        st["body"]["ball"]["pos_x"] /= (e_GAME_CONSTANTS.WIDTH / 2)
        st["body"]["ball"]["pos_y"] /= (e_GAME_CONSTANTS.HEIGHT / 2)

        //Normalize players
        st["body"]["players"].forEach((player: PlayerState) => {
            player["pos_y"] /= (e_GAME_CONSTANTS.HEIGHT / 2)
		});
        //Normalize ball velocity
        st["body"]["ball"]["vel_x"] /= vel_mg
        st["body"]["ball"]["vel_y"] /= vel_mg
        return (st);
	}

    private	ft_getStateTensorMLP(states: StateResponseMsg[]): Tf.Tensor {

		const	buffer = Tf.buffer([states.length, this.fields]);
		states.forEach((st, i) => {
            //The sign is significant because give us information about where is the ball and myself.
            const	discriminant_y = (st["body"]["ball"]["pos_y"] - st["body"]["players"][1]["pos_y"]) / e_GAME_CONSTANTS.HEIGHT
            //The sign here is not significant, because we just need to know how far is the ball from us.
            const	discriminant_x = Math.abs(st["body"]["ball"]["pos_x"] - PARAMS["rigth_bound"]) / e_GAME_CONSTANTS.WIDTH
            const	st_norm = this.ft_normalizeState(st)

            const	ball = st_norm["body"]["ball"]
            const	players = st_norm["body"]["players"]

            // Put values into the correct feature vector positions
            buffer.set(ball["pos_x"], i, 0);
			buffer.set(ball["pos_y"], i, 1);
			buffer.set(ball["vel_x"], i, 2);
			buffer.set(ball["vel_y"], i, 3);
			buffer.set(players[0]["pos_y"], i, 4);
			buffer.set(players[1]["pos_y"], i, 5);
			buffer.set(discriminant_y, i, 6);
			buffer.set(discriminant_x, i, 7);
		});
        return (buffer.toTensor()); 
	}


	public	ft_subscribeToSocket() : void {
		/*[!PENDING]: How to handle errors from initialization.*/
		/*[!PENDING]: How to handle the other events*/
		try {
			this.socket = new WebSocket(this.url);
			this.socket.addEventListener("message", (ev: MessageEvent<any>) => {
				const	msg: MessageGame = JSON.parse(ev.data);
				if (msg.type == e_TYPE_MESSAGE.NOTIFICATION) {
					const	noti = msg as NotificationMsg;
					if (noti.body.status == e_GAME_STATE.START) {
						if (this.socket?.readyState) {
							this.socket?.send(JSON.stringify(
								{
									type: e_TYPE_MESSAGE.STATUS_REQUEST,
									body: {
										status: e_PLAYER_STATE.READY
									}
								}
							));
						}
					}
				}
				else if (msg.type == e_TYPE_MESSAGE.STATE_RESPONSE) {
					Tf.tidy(() => {
						const	msg_st = msg as StateResponseMsg;
						if (msg_st.body.players.length < 2)
							return ;
						const	tensor = this.ft_getStateTensorMLP([msg_st]);
						const	tensor_prediction = this.model?.predict(tensor);
						let	action = e_ACTION.IDLE;
						if (! (tensor_prediction instanceof Array))
							action = (tensor_prediction?.argMax(-1).dataSync()[0] ?? e_ACTION.IDLE);
						if (this.socket?.readyState) {
							this.socket?.send(JSON.stringify({
								type: e_TYPE_MESSAGE.STATE_REQUEST,
								body: {
									player: {
										action: action
									}
								}
							}));
						}
					});
				}
			});
		}
		catch (err: unknown) {
		}
	}
}
