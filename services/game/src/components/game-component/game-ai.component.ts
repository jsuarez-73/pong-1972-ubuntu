import { Game } from "@components/game-component/game.component.ts";
import { RefereeTrain } from "../referee/referee-train.component.ts";

export class	AiGame extends Game {

	constructor (socket: WebSocket, req: SocketRequest, ref: RefereeTrain) {
		super(socket, req, ref);
	}
}
