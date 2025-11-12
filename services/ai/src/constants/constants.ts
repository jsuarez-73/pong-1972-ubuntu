export enum	e_GAME_CONSTANTS {
	WIDTH = 274,
	HEIGHT = 153,
	BALL = 4,
	RACQUET = 20,
	RACQUET_THICK = 5,
	HALF_RTHICK = Math.round(RACQUET_THICK / 2),
	HALF_WIDTH = Math.round(WIDTH / 2),
	HALF_BALL = Math.round(BALL / 2),
	HALF_RACQUET = Math.round(RACQUET / 2),
	COUNTER_FINISH = 72,
	COUNTER_START = 3
}

/*[PENDING][FIXBUG]: When the global state fix its bug we must remove the + 1 in the 
* epsilon param.*/
export const PARAMS = {
	upper_bound: e_GAME_CONSTANTS.HEIGHT / 2,
	lower_bound: -e_GAME_CONSTANTS.HEIGHT / 2,
	rigth_bound: (e_GAME_CONSTANTS.WIDTH / 2) - e_GAME_CONSTANTS.RACQUET_THICK,
	left_bound: -e_GAME_CONSTANTS.WIDTH / 2 + e_GAME_CONSTANTS.RACQUET_THICK,
	epsilon: (e_GAME_CONSTANTS.BALL / 2 + 1),
	omega: 0.1,
	delta_y: e_GAME_CONSTANTS.RACQUET / 2,
	ball_x_start: 0,
	ball_y_start: (e_GAME_CONSTANTS.HEIGHT - e_GAME_CONSTANTS.BALL) / 2,
	points_to_win: 5,
	steps_per_action: e_GAME_CONSTANTS.HALF_RACQUET
};

export enum e_BALL_ACTION {
	MOVE = 0,
	BOUNCE = -1,
	SCORE_P1 = 1,
	SCORE_P2 = 2

}

export enum	e_TAG_PLAYER {
	ONE,
	TWO
}

export enum	e_ACTION {
	UP,
	DOWN,
	IDLE
}

export enum	e_GAME_STATE {
	START,
	COUNTDOWN,
	READY,
	FINISH,
	UNKNOWN
}

export enum	e_PLAYER_STATE {
	READY,
	WAIT
}

export enum	e_TYPE_MESSAGE {
	STATE_REQUEST,
	STATUS_REQUEST,
	STATE_RESPONSE,
	NOTIFICATION,
	ERROR_RESPONSE,
	CLOSE_REQUEST,
	UNDEFINED
}

export enum	e_ERROR_RESPONSE {
	MALFORMED_MSG
}

export enum	e_REWARD {
	LOSER = -1,
	OP_SCORES = -5,
	MV_WRONG = -0.01,
	NO_REWARD = 0,
	HIT_BALL = 1 
}
