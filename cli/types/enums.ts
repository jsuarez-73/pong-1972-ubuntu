export enum	e_LABEL_SIZE {
	LARGE,
	MEDIUM,
	SMALL
}

export enum	e_ASCII_ART_FONT {
	DEFAULT,
	SHADOW,
	MINIWI
}

export enum	e_DIRECTION {
	BLOCK_UP,
	BLOCK_DOWN,
	FLEX_LEFT,
	FLEX_RIGHT
}

export enum	e_Colors {
	FG_BLACK = "\x1b[30m",
	FG_RED = "\x1b[31m",
	FG_GREEN = "\x1b[32m",
	FG_YELLOW = "\x1b[33m",
	FG_BLUE = "\x1b[34m",
	FG_MAGENTA = "\x1b[35m",
	FG_CYAN = "\x1b[36m",
	FG_WHITE = "\x1b[37m",
	FGH_BLACK = "\x1b[90m",
	FGH_RED = "\x1b[91m",
	FGH_GREEN = "\x1b[92m",
	FGH_YELLOW = "\x1b[93m",
	FGH_BLUE = "\x1b[94m",
	FGH_MAGENTA = "\x1b[95m",
	FGH_CYAN = "\x1b[96m",
	FGH_WHITE = "\x1b[97m",
	FG_DEFAULT = "\x1b[39m",
	BG_BLACK = "\x1b[40m",
	BG_RED = "\x1b[41m",
	BG_GREEN = "\x1b[42m",
	BG_YELLOW = "\x1b[43m",
	BG_BLUE = "\x1b[44m",
	BG_MAGENTA = "\x1b[45m",
	BG_CYAN = "\x1b[46m",
	BG_WHITE = "\x1b[47m",
	BG_DEFAULT = "\x1b[49m",
	RESET = "\x1b[0m"
}

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
}

export enum	e_PONG_COURT_VM {
	PADDING_UP = 2,
	PADDING_LEFT = 3,
	PADDING_RIGHT = 3,
	PADDING_LOW = 5,
	PADDING_LABELS = 4
}

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

