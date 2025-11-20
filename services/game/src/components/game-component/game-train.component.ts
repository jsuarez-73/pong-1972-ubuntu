import { WebSocket } from "@fastify/websocket";
import { e_TAG_PLAYER } from "@game-types/enums";
import { RefereeTrain } from "../referee/referee-train.component";
import { Game } from "./game.component";

/*[PENDING][PINNED][URGENT]: Set the trainig mode to check visually how is the behaviour of the model,
* also to save some memory caused by only one model and not two. Make sure the ball!*/
export class	GameTrain extends Game {

	protected	watcher: e_TAG_PLAYER | undefined;

	constructor (socket: WebSocket, req: SocketRequest, ref: RefereeTrain) {
		super(socket, req, ref);
	}

	public	ft_incommingSocket (socket: WebSocket, req: SocketRequest) {
		/*[!IMPORTANT][!PENDING]: We must verify the player comming got the token
		* registered to make the reconnection.*/
		const	is_watcher = (req.params?.user == "watcher");
		if (is_watcher && ! this.players[e_TAG_PLAYER.ONE].ft_getIsReady()) {
			this.ft_setPlayer(socket, e_TAG_PLAYER.ONE);
			this.ft_setWatcher(e_TAG_PLAYER.ONE)
		}
		else if (! is_watcher && ! this.players[e_TAG_PLAYER.TWO].ft_getIsReady())
			this.ft_setPlayer(socket, e_TAG_PLAYER.TWO);
		else {
			/*[!PENDING]: Must send a message to let others users to know
			* that there's not space for them in this game!*/
			socket.close(1000, "Already set the match");
		}
	}

	public	ft_setWatcher(watcher: e_TAG_PLAYER): void {
		this.watcher = watcher;
		(this.referee as RefereeTrain).ft_setWatcherGlobalState(watcher);
	}
}
