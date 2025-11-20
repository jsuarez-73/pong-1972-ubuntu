from enum import Enum, IntEnum
from dataclasses import dataclass

class e_GAME_CONSTANTS(IntEnum):
    WIDTH = 274
    HEIGHT = 153
    BALL = 4
    RACQUET = 20
    RACQUET_THICK = 5
    HALF_RTHICK = round(RACQUET_THICK / 2)
    HALF_WIDTH = round(WIDTH / 2)
    HALF_BALL = round(BALL / 2)
    HALF_RACQUET = round(RACQUET / 2)
    COUNTER_FINISH = 72
    COUNTER_START = 3

PARAMS = {
    "upper_bound": e_GAME_CONSTANTS.HEIGHT / 2,
    "lower_bound": -e_GAME_CONSTANTS.HEIGHT / 2,
    "rigth_bound": (e_GAME_CONSTANTS.WIDTH / 2) - e_GAME_CONSTANTS.RACQUET_THICK,
    "left_bound": -e_GAME_CONSTANTS.WIDTH / 2 + e_GAME_CONSTANTS.RACQUET_THICK,
    "epsilon": e_GAME_CONSTANTS.BALL / 2,
    "omega": 0.1,
    "delta_y": e_GAME_CONSTANTS.RACQUET / 2,
    "ball_x_start": 0,
    "ball_y_start": (e_GAME_CONSTANTS.HEIGHT - e_GAME_CONSTANTS.BALL) / 2,
    "points_to_win": 5,
    "steps_per_action": e_GAME_CONSTANTS.HALF_RACQUET
}

class e_BALL_ACTION(IntEnum):
    MOVE = 0
    BOUNCE = -1
    SCORE_P1 = 1
    SCORE_P2 = 2

class e_TAG_PLAYER(IntEnum):
    ONE = 0
    TWO = 1

class e_ACTION(IntEnum):
    UP = 0
    DOWN = 1
    IDLE = 2

class e_GAME_STATE(IntEnum):
    START = 0
    COUNTDOWN = 1
    READY = 2
    FINISH = 3
    UNKNOWN = 4

class e_PLAYER_STATE(IntEnum):
    READY = 0
    WAIT = 1

class e_TYPE_MESSAGE(IntEnum):
    STATE_REQUEST = 0
    STATUS_REQUEST = 1
    STATE_RESPONSE = 2
    NOTIFICATION = 3
    ERROR_RESPONSE = 4
    CLOSE_REQUEST = 5
    UNDEFINED = 6

class e_ERROR_RESPONSE(IntEnum):
    MALFORMED_MSG = 0

class e_REWARD(float, Enum):
    LOSER = -1
    OP_SCORES = -1
    SURVIVAL = 0.0001
    MV_WRONG = 0 #[PENDING][TEST]-0.00002  # keep near -0.01 if desired
    NO_REWARD = 0
    HIT_BALL = 0.1
    REDUCE_IMPACT = 0.1
