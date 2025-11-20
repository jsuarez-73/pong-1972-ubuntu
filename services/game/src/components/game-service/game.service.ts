import { GameServer } from "@components/server/server.component";
import { Game } from "@components/game-component/game.component";
import { WebSocket } from "@fastify/websocket";
import { SERVICES } from "@core/constants/constants";
import { GameTrain } from "../game-component/game-train.component";
import { Referee } from "../referee/referee.component";
import { GlobalStateTrain } from "../state/state-train.component";
import { GlobalState } from "../state/state.component";
import { RefereeTrain } from "../referee/referee-train.component";
import { AiGame } from "../game-component/game-ai.component.ts";

export class GameService extends GameServer {
	private	static game_service: GameService | null = null;
	private			game_log: Map<number,Game> = new Map();
	private			train_log: Map<number, GameTrain> = new Map();
	private			ai_log: Map<number, GameTrain> = new Map();
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
		},
		{
			method: "GET",
			url: SERVICES.ai,
			handler: (req: any, rep: any) => this.ft_gameAIHandler(req, rep),
			wsHandler: (socket: WebSocket, req: SocketRequest) => {
			 this.ft_wsGameAIHandler(socket, req)
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

	private	ft_gameAIHandler(req: any, rep: any) : void {
		void req, rep;
		/*[PENDING]: What to in case the request is made by Http protocol*/
	}

	private ft_wsHandler(socket: WebSocket, req: SocketRequest) : void {
		const	game_log = this.game_log.get(Number(req.params.id));
		if (!game_log) {
			const	game = new Game(socket, req, new Referee(new GlobalState()));
			game.ft_setDisposal(() => {
				this.game_log.delete(Number(req.params.id));
			});
			this.game_log.set(Number(req.params.id), game);
			return ;
		}
		game_log.ft_incommingSocket(socket, req);
	}

	private	ft_wsGameAIHandler(socket: WebSocket, req: SocketRequest) : void {
		/*[PENDING][URGENT][PINNED]: Set the AiGame component to test the model with the cli and the server.*/
		const	ai_log = this.ai_log.get(Number(req.params.id));
		if (!ai_log) {
			const	ai_game = new AiGame(
				socket,
				req,
				new Referee(new GlobalState())
			);
			ai_game.ft_setDisposal(() => {
				this.ai_log.delete(Number(req.params.id));
			});
			this.ai_log.set(Number(req.params.id), ai_game);
			return ;
		}
		ai_log.ft_incommingSocket(socket, req);
	}

	/*Must be destroyed each Referee, GameTrain and GlobalState by this way we
	 * ensure a new Game. The client it's responsable to send the request again.*/
	private ft_wsTrainHandler(socket: WebSocket, req: SocketRequest) : void {
		const	train_log = this.train_log.get(Number(req.params.id));
		if (!train_log) {
			const	training_game = new GameTrain(
				socket,
				req,
				new RefereeTrain(new GlobalStateTrain())
			);
			training_game.ft_setDisposal(() => {
				this.train_log.delete(Number(req.params.id));
			});
			this.train_log.set(Number(req.params.id), training_game);
			return ;
		}
		train_log.ft_incommingSocket(socket, req);
	}
}
