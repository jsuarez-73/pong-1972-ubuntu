from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Literal, Dict, Any
from enum import IntEnum
from src_py.constants.constants import (
    e_ACTION, e_ERROR_RESPONSE, e_REWARD, e_TAG_PLAYER,
    e_TYPE_MESSAGE, e_GAME_STATE, e_PLAYER_STATE
)

class e_GAME_CHANNEL(IntEnum):
    BALL_CH = 0
    RONE_CH = 1
    RTWO_CH = 2

@dataclass
class BallState:
    pos_x: float
    pos_y: float

@dataclass
class PlayerState:
    pos_y: float
    action: e_ACTION
    tag: e_TAG_PLAYER
    score: int

@dataclass
class NotificationPayload:
    p1: e_PLAYER_STATE
    p2: e_PLAYER_STATE
    countdown_finish: bool
    counter: Optional[int] = None
    winner: Optional[e_TAG_PLAYER] = None
    losers: Optional[list[e_TAG_PLAYER]] = None

# Message bodies
@dataclass
class StateNotificationBody:
    status: e_GAME_STATE

@dataclass
class StateRequestBody:
    player: Dict[str, e_ACTION]  # {"action": e_ACTION}

@dataclass
class ErrorResponseBody:
    code: e_ERROR_RESPONSE
    msg: str

@dataclass
class StateResponseBody:
    ball: BallState
    players: List[PlayerState]

@dataclass
class StatusRequestBody:
    status: e_PLAYER_STATE

@dataclass
class NotificationBody:
    status: e_GAME_STATE
    payload: NotificationPayload

@dataclass
class MessageGame:
    type: e_TYPE_MESSAGE
    body: Any
    tag: e_TAG_PLAYER

# Specializations
@dataclass
class StateNotificationMsg(MessageGame):
    type: Literal[e_TYPE_MESSAGE.NOTIFICATION]

@dataclass
class StateRequestMsg(MessageGame):
    type: Literal[e_TYPE_MESSAGE.STATE_REQUEST]

@dataclass
class ErrorResponseMsg(MessageGame):
    type: Literal[e_TYPE_MESSAGE.ERROR_RESPONSE]

@dataclass
class StateResponseMsg(MessageGame):
    type: Literal[e_TYPE_MESSAGE.STATE_RESPONSE]
    body: StateResponseBody

@dataclass
class StatusRequestMsg(MessageGame):
    type: Literal[e_TYPE_MESSAGE.STATUS_REQUEST]

@dataclass
class NotificationMsg(MessageGame):
    type: Literal[e_TYPE_MESSAGE.NOTIFICATION]
    body: NotificationBody

@dataclass
class AgentConfig:
    tag: e_TAG_PLAYER
    epsilon_init: float
    epsilon_final: float
    epsilon_decay_frames: int
    replay_buffer_size: int
    learning_rate: float

@dataclass
class PlayerTag:
    my_tag: e_TAG_PLAYER
    adv_tag: e_TAG_PLAYER

@dataclass
class ReplayMemoryItem:
    state: StateResponseMsg
    action: e_ACTION
    reward: e_REWARD
    done: bool
    next_state: StateResponseMsg
