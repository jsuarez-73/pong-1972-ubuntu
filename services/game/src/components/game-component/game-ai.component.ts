import { WebSocket } from "@fastify/websocket";
import { Game } from "@components/game-component/game.component";
import { Referee } from "../referee/referee.component";

export class	AiGame extends Game {

	constructor (socket: WebSocket, req: SocketRequest, ref: Referee) {
		super(socket, req, ref);
	}

	/*[PENDING]: Override the ft_setDisposal to avoid sending information to other services.*/
	public	ft_setDisposal(disposal : (() => void)): void {
		this.disposal_game_service = disposal;
	}
}
