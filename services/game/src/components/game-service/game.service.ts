import { GameServer } from "@components/server/server.component";
import { Game } from "@components/game-component/game.component";
import { WebSocket } from "@fastify/websocket";
import { SERVICES } from "@core/constants/constants";
import { GameTrain } from "../game-component/game-train.component";
import { Referee } from "../referee/referee.component";
import { GlobalStateTrain } from "../state/state-train.component";
import { GlobalState } from "../state/state.component";
import { RefereeTrain } from "../referee/referee-train.component";

export class GameService extends GameServer {
	private	static game_service: GameService | null = null;
	private			gameLog: Map<number,Game> = new Map();
	private			trainLog: Map<number, GameTrain> = new Map();
	protected		routes: Routes[] = [
		{
			method: "GET",
			url: SERVICES.game,
			handler: (req: any, rep: any) => this.ft_gameHandler(req, rep),
			wsHandler: (socket: WebSocket, req: SocketRequest) => {
			 this.ft_wsHandler(socket, req)
			}
		},
		{
			method: "GET",
			url: SERVICES.train,
			handler: (req: any, rep: any) => this.ft_trainHandler(req, rep),
			wsHandler: (socket: WebSocket, req: SocketRequest) => {
			 this.ft_wsTrainHandler(socket, req)
			}
		}
	];

	constructor () {
		super();
		if (GameService.game_service)
			return (this);
		GameService.game_service = this;
		this.ft_startServer();
	}

	private	ft_gameHandler(req: any, rep: any) : void {
		/*[PENDING]: What to in case the request is made by Http protocol*/
		void req, rep;
	}

	private	ft_trainHandler(req: any, rep: any) : void {
		void req, rep;
		/*[PENDING]: What to in case the request is made by Http protocol*/
	}

	private ft_wsHandler(socket: WebSocket, req: SocketRequest) : void {
		const	gameLog = this.gameLog.get(Number(req.params.id));
		if (!gameLog) {
			const	game = new Game(socket, req, new Referee(new GlobalState()));
			game.ft_setDisposal(() => {
				this.gameLog.delete(Number(req.params.id));
			});
			this.gameLog.set(Number(req.params.id), game);
			return ;
		}
		gameLog.ft_incommingSocket(socket, req);
	}

	/*[PENDING][URGENT][PINNED]: Must be destroyed each Referee, GameTrain and 
	* GlobalState by this way we ensure a new Game but also we make sure to save the
	* watcher socket to add it up when recreating it.*/
	private ft_wsTrainHandler(socket: WebSocket, req: SocketRequest) : void {
		const	trainLog = this.trainLog.get(Number(req.params.id));
		if (!trainLog) {
			const	training_game = new GameTrain(
				socket,
				req,
				new RefereeTrain(new GlobalStateTrain())
			);
			training_game.ft_setDisposal(() => {
				this.trainLog.delete(Number(req.params.id));
			});
			this.trainLog.set(Number(req.params.id), training_game);
			return ;
		}
		trainLog.ft_incommingSocket(socket, req);
	}
}
