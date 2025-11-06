import { Referee } from "@components/referee/referee.component";
import type { WebSocket } from "@fastify/websocket";
import { Player } from "@components/player/player.component";
import { Subject } from "@segfaultx/observable";
import { e_TAG_PLAYER } from "@game-types/enums";

export class Game {

	private	id: number;
	private	referee: Referee = new Referee();
	private	players: Player[] = [
		new Player(e_TAG_PLAYER.ONE),
		new Player(e_TAG_PLAYER.TWO)
	];
	private	msg_request: Subject<MessageGame> = new Subject<MessageGame>();
	private msg_response: Subject<MessageGame> = new Subject<MessageGame>();
	private	isTraining: boolean;
	private	disposal_game_service: (() => void) = () => {};
	/*[!PENDING]: Must be re-evaluated the authenthication from players before
	* allow them to reconnect to a started game. Because in case a user loose 
	* the connection when playing, another one can try to connect to it and 
	* steal the game session.
	* Taking the usernames could be enough and verifying the token authenticity
	* with the Auth Service. (Maybe)*/
	private	tokens: string[] = new Array<string>();

	constructor (socket: WebSocket, req: SocketRequest, config?: ConfigGame) {
		/*[PENDING]: Read the isTraining when the Game will send the result to services, thus
		* avoid when is training to skip logs from ai models.*/
		this.isTraining = config?.isTrainingGame ?? false;
		this.id = Number(req.params.id);
		this.ft_incommingSocket(socket);
		this.msg_request.ft_subscribe(this.referee.ft_getObserver());
		this.referee.ft_setEmitter(this.msg_response);
		this.referee.ft_setDisposalGame(() => this.ft_gameFinish());
	}

	public	ft_incommingSocket (socket: WebSocket) {
		/*[!IMPORTANT][!PENDING]: We must verify the player comming got the token
		* registered to make the reconnection.*/
		if (! this.players[e_TAG_PLAYER.ONE].ft_getIsReady())
			this.ft_setPlayer(socket, e_TAG_PLAYER.ONE);
		else if (! this.players[e_TAG_PLAYER.TWO].ft_getIsReady())
			this.ft_setPlayer(socket, e_TAG_PLAYER.TWO);
		else {
			/*[!PENDING]: Must send a message to let others users to know
			* that there's not space for them in this game!*/
			socket.close(1000, "Already set the match");
		}
	}

	private	ft_setPlayer (socket: WebSocket, tag: e_TAG_PLAYER) {
		this.players[tag].ft_setSocket(socket);
		this.players[tag].ft_setEmitter(this.msg_request);
		this.msg_response.ft_subscribe(this.players[tag].ft_getObserver());
		this.referee.ft_addPlayerUp(tag);
	}

	public	ft_getId() : number {
		return (this.id);
	}

	/*[!PENDING]: Debug if the objects are really disposed.
	* [!UPDATE]: It's working well, the game is disposed, but 
	* The players must be well identified to avoid the same player	
	* To connect twice as it was a different one.*/
	public	ft_gameFinish(): void {
		console.log(`Must finish the match.`);
		this.players.forEach((player) => player.ft_disposeSocket());
		this.disposal_game_service();
	}

	/*[PENDING]: Before disposal the game must send the information to appropiate services to
	* be log and used to other means.*/
	public	ft_setDisposal(disposal : (() => void)): void {
		this.disposal_game_service = disposal;
	}
}
