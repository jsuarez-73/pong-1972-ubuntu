import { e_ACTION, e_ERROR_RESPONSE, e_REWARD, e_TAG_PLAYER, e_TYPE_MESSAGE } from "@constants/constants"

export	enum	e_GAME_CHANNEL {
	BALL_CH,
	RONE_CH,
	RTWO_CH
};

type	StateNotificationBody = {
	status: e_GAME_STATE,
};

type	StateRequestBody = { 
	player: {
		action: e_ACTION
	},
}

type	ErrorResponseBody = {
	code: e_ERROR_RESPONSE,
	msg: string
}

type	StateResponseBody = {
	ball: BallState,
	players: PlayerState[],
}

type	StatusRequestBody = {
	status: e_PLAYER_STATE
}

type	NotificationBody = {
	status: e_GAME_STATE,
	payload: NotificationPayload
}


export interface	MessageGame {
	type: e_TYPE_MESSAGE,
	body: StatusRequestBody |
		NotificationBody |
		StateResponseBody |
		ErrorResponseBody |
		StateNotificationBody |
		StateRequestBody
	tag: e_TAG_PLAYER
};

export interface BallState {
	pos_x: number,
	pos_y: number
};

export interface PlayerState {
	pos_y: number,
	action: e_ACTION,
	tag: e_TAG_PLAYER,
	score: number
};

export interface	BufGameState {
	buf_racquet_one: number[][],
	buf_racquet_two: number[][],
	buf_ball: number[][]
};

export enum	e_GAME_STATE {
	START,
	COUNTDOWN,
	READY,
	FINISH,
	UNKNOWN
};

export enum	e_PLAYER_STATE {
	READY,
	WAIT
};

export type	NotificationPayload = {
	p1: e_PLAYER_STATE,
	p2: e_PLAYER_STATE,
	countdown_finish: boolean,
	counter?: number,
	winner?: e_TAG_PLAYER,
	losers?: e_TAG_PLAYER[]
};

export interface	StateNotificationMsg extends MessageGame {
	type: e_TYPE_MESSAGE.NOTIFICATION,
	body: StateNotificationBody
}

export interface	StateRequestMsg extends MessageGame {
  type: e_TYPE_MESSAGE.STATE_REQUEST,
  body: StateRequestBody
}

export interface	ErrorResponseMsg extends MessageGame {
	type: e_TYPE_MESSAGE.ERROR_RESPONSE,
	body: ErrorResponseBody
}

export interface	StateResponseMsg extends MessageGame {
	type: e_TYPE_MESSAGE.STATE_RESPONSE,
	body: StateResponseBody
}

export interface	StatusRequestMsg extends MessageGame {
	type: e_TYPE_MESSAGE.STATUS_REQUEST,
	body: StatusRequestBody
}

export interface	NotificationMsg extends MessageGame {
	type: e_TYPE_MESSAGE.NOTIFICATION,
	body: NotificationBody
}


export interface	AgentConfig {
	tag: e_TAG_PLAYER
	epsilon_init: number,
	epsilon_final: number,
	epsilon_decay_frames: number,
	replay_buffer_size: number,
	learning_rate: number
};

export interface	PlayerTag {
	my_tag: e_TAG_PLAYER,
	adv_tag: e_TAG_PLAYER
};

export interface	ReplayMemoryItem {
	state: StateResponseMsg,
	action: e_ACTION,
	reward: e_REWARD,
	done: boolean,
	next_state: StateResponseMsg
}
