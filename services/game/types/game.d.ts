/*Game Service Model*/

/*enums type must be alive in runtime, this file is just used during compile time.*/
/*implementation can't be done here, in this ambient context.*/
type	ConfigGame = {
	isTrainingGame: boolean
}
type	TagPlayer = e_TAG_PLAYER;
type	ConfigGameServer = {port: number, host?: string, [key: string]: boolean | number | string};
type	Routes = { method: string, url: string, handler?: Function, [key: string]: unknown};
type	Fastify = any;
type	SocketRequest = {
	body: any,
	id: string,
	log: any,
	params: any,
	query: any,
	raw: IncomingMessage,
	ws: boolean
};

type	NotificationPayload = {
	p1: e_PLAYER_STATE,
	p2: e_PLAYER_STATE,
	countdown_finish: boolean,
	counter?: number,
	winner?: e_TAG_PLAYER,
	losers?: e_TAG_PLAYER[]
}

type	Subscription = { unsubscribe: Function };

/**
	* author-comment: This is not a very good implementation, a better one would have	
	* been separate MessageGame in Request and Responses and set compulsory the tag
	* field.*/
interface	MessageGame {
	type: e_TYPE_MESSAGE,
	body: any
	tag?: e_TAG_PLAYER
};

interface	StateNotificationMsg extends MessageGame {
	type: e_TYPE_MESSAGE.NOTIFICATION,
	body: {
		status: e_GAME_STATE,
		payload: NotificationPayload
	}
}

interface	StateRequestMsg extends MessageGame {
  type: e_TYPE_MESSAGE.STATE_REQUEST,
  body: { 
	  player: {
		  action: e_ACTION
	  }
  }
}

interface	ErrorResponseMsg extends MessageGame {
	type: e_TYPE_MESSAGE.ERROR_RESPONSE,
	body: {
		code: e_ERROR_RESPONSE,
		msg: string
	}
}

interface	StateResponseMsg extends MessageGame {
	type: e_TYPE_MESSAGE.STATE_RESPONSE,
	body: {
		ball: BallState,
		players: PlayerState[],
	}
}

interface	StatusRequestMsg extends MessageGame {
	type: e_TYPE_MESSAGE.STATUS_REQUEST,
	body: {
		status: e_PLAYER_STATE
	}
}

interface	SubjectEmitter<T> {
	public	ft_setEmitter(subject: Subject<T>): void;
}

interface	SubjectObserver<T> {
	public	ft_getObserver() : Observer<T>;
}

/*Assertion Typescript functions.*/
declare	function isStateRequestMsg (msg: MessageGame) : msg is StateRequestMsg;
/***/
