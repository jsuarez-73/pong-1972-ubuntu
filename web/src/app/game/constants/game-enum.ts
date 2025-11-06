import { warn } from "console";

export enum GameEnum {
}

export enum GameCourtServerSettingsEnum {
  WIDTH = 274,
  HEIGHT = 153,
  BALL = 4,
  RACQUET = 20,
  RACQUET_THICK = 5, // Must be 3 in roder to get a good proportion
  COUNTER_FINISH = 72,
	COUNTER_START = 3
}

export enum GameTypeMessageEnum {
  STATE_REQUEST,
  STATUS_REQUEST,
	STATE_RESPONSE,
	NOTIFICATION,
	ERROR_RESPONSE,
	CLOSE_REQUEST,
	UNDEFINED
}

export enum	GameStateEnum {
	START, // estamos conectados para jugar pero no estamos ready
	COUNTDOWN, // si los dos estan ready(PlayerStateEnum) 3 2 1
	READY, // empieza el juego
	FINISH,
	UNKNOWN
}

export enum GameCourtEnum {
  COURT_WIDTH = GameCourtServerSettingsEnum.WIDTH * 3,
  COURT_HEIGHT = GameCourtServerSettingsEnum.HEIGHT * 3,
  BALL = GameCourtServerSettingsEnum.BALL * 3,
  PADDLE_HEIGHT = GameCourtServerSettingsEnum.RACQUET * 3,
  PADDLE_THICKNESS = GameCourtServerSettingsEnum.RACQUET_THICK * 3,
}

  //COURT_WIDTH = 640,
  //COURT_HEIGHT = 480,
  //BALL = 10,
  //PADDLE_HEIGHT = 60,
  //PADDLE_THICKNESS = 10,

export enum ScaleEnum {
  X = GameCourtEnum.COURT_WIDTH / GameCourtServerSettingsEnum.WIDTH,
  Y = GameCourtEnum.COURT_HEIGHT / GameCourtServerSettingsEnum.HEIGHT
}

export enum PlayerStateEnum {
  READY,
  WAIT
}

export enum TagPlayerEnum {
  ONE,
  TWO,
  UNKNOWN
}

export enum PlayerSideEnum {
  LEFT,
  RIGHT,
  UNKNOWN
}

export enum PlayerActionEnum {
  UP,
  DOWN,
  IDLE
}

export enum	ErrorResponseEnum {
	MALFORMED_MSG
}

export enum ScoreEnum {
  DEFAULT = 0
}

export enum ColorPaletteEnum {
  YELLOW = '#f7da62',
  ORANGE = '#fdb048',
  TANGARINE = '#eb8958',
  WHITE = '#f2f2f0',
  BROWN = '#61544b',
  GRAY = '#303030',
  BLACK = '#252525'
}
