import {
  ErrorResponseEnum,
  GameStateEnum,
  GameTypeMessageEnum,
  PlayerActionEnum,
  PlayerStateEnum,
  TagPlayerEnum
} from "../constants/game-enum";

export interface GameMessage {
  type: GameTypeMessageEnum;
  body: any;
  tag?:  TagPlayerEnum;
}

export	interface	BallState {
	pos_x: number;
	pos_y: number;
	pos_y_backup: number;
	pos_x_backup: number;
	vel_x: number;
	vel_y: number;
	time_step: number;
}

export interface PlayerState {
  pos_y: number;
  action: PlayerActionEnum;
  tag: TagPlayerEnum;
  score: number;
}

export interface NotificationPayload {
	p1: PlayerStateEnum;
	p2: PlayerStateEnum;
	countdown_finish: boolean;
	counter?: number;
	winner?: TagPlayerEnum;
	losers?: TagPlayerEnum[];
}

/* Will change only for PlayerActionEnum
 */
export interface StateRequestMessage extends GameMessage {
  type: GameTypeMessageEnum.STATE_REQUEST;
  body: {
    player: {
      action: PlayerActionEnum;
    }
  }
}

export interface StatusRequestMessage extends GameMessage {
  type: GameTypeMessageEnum.STATUS_REQUEST;
  body: {
    status: PlayerStateEnum;
  }
}

export interface StateResponseMessage extends GameMessage {
  type: GameTypeMessageEnum.STATE_RESPONSE;
  body: {
    ball: BallState;
    players: PlayerState[];
  }
}

export interface NotificationMessage extends GameMessage {
  type: GameTypeMessageEnum.NOTIFICATION;
  body: {
    status: GameStateEnum;
    payload: NotificationPayload;
  }
}

export interface ErrorResponseMessage extends GameMessage {
  type: GameTypeMessageEnum.ERROR_RESPONSE;
  body: {
    code: ErrorResponseEnum;
    msg: string;
  }
}

