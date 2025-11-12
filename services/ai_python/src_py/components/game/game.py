import json
import threading
from typing import List, Optional
import numpy as np
import tensorflow as tf
from websocket import WebSocketApp

from src_py.constants.constants import e_GAME_CONSTANTS, e_TAG_PLAYER, e_TYPE_MESSAGE, e_GAME_STATE
from src_py.types.t_game import (
    BallState, PlayerState, StateResponseMsg, MessageGame, StateNotificationMsg
)
from src_py.utils.observable import Observer

class PongGame:
    def __init__(self, url: str):
        self._url: str = ""
        self.url = url
        self._last_message_lock = threading.Lock()
        self._listener: Optional[Observer[bool]] = None
        self._ws: Optional[WebSocketApp] = None
        self._ws_thread: Optional[threading.Thread] = None

    @property
    def hsquares(self) -> int: return 30
    @property
    def vsquares(self) -> int: return 30
    @property
    def channels(self) -> int: return 3

    @property
    def url(self) -> str: return self._url
    @url.setter
    def url(self, url: str):
        if not url:
            raise ValueError("Must be defined an url")
        self._url = url

    def ft_reset(self) -> None:
        # nothing persistent besides the socket in this client
        pass

    def _ft_setAbsolutePositions(self, positions: List[dict]) -> None:
        for p in positions:
            if "pos_x" in p and p["pos_x"] is not None:
                p["pos_x"] = e_GAME_CONSTANTS.WIDTH / 2 + p["pos_x"]
            if "pos_y" in p and p["pos_y"] is not None:
                p["pos_y"] = e_GAME_CONSTANTS.HEIGHT / 2 - p["pos_y"]

    def _ft_fillPlayerOnDiscreteState(self, buf: np.ndarray, player: PlayerState, batch_index: int) -> None:
        hratio = self.vsquares / e_GAME_CONSTANTS.HEIGHT
        center = int(np.floor(player.pos_y * hratio))
        half_racquet = int(np.round(e_GAME_CONSTANTS.HALF_RACQUET * hratio))
        rq_start = max(0, center - half_racquet)
        rq_end = min(self.vsquares - 1, center + half_racquet)
        for y in range(rq_start, rq_end + 1):
            if player.tag == e_TAG_PLAYER.ONE:
                buf[batch_index, y, 0, 1] = 1.0
            elif player.tag == e_TAG_PLAYER.TWO:
                x = self.hsquares - 1
                buf[batch_index, y, x, 2] = 1.0

    def ft_getStateTensor(self, states: List[StateResponseMsg]) -> tf.Tensor:
        # buffer shape: [batch, H, W, C]
        buffer = np.zeros((len(states), self.vsquares, self.hsquares, self.channels), dtype=np.float32)
        for i, st in enumerate(states):
            # deep copy via json; we won't mutate original
            st_copy = json.loads(json.dumps(st, default=lambda o: o.__dict__))
            ball = st_copy["body"]["ball"]
            players = st_copy["body"]["players"]
            # to absolute
            self._ft_setAbsolutePositions([ball])
            self._ft_setAbsolutePositions(players)

            hratio = (self.hsquares - 1) / e_GAME_CONSTANTS.WIDTH
            vratio = (self.vsquares - 1) / e_GAME_CONSTANTS.HEIGHT
            cx = int(np.floor(ball["pos_x"] * hratio))
            cy = int(np.floor(ball["pos_y"] * vratio))
            buffer[i, cy, cx, 0] = 1.0

            # players back to dataclass-like access
            for p in players:
                ps = PlayerState(
                    pos_y=float(p["pos_y"]),
                    action=p["action"],
                    tag=p["tag"],
                    score=int(p["score"])
                )
                self._ft_fillPlayerOnDiscreteState(buffer, ps, i)

        return tf.convert_to_tensor(buffer)

    def ft_subscribeToSocket(self, ob: Observer[MessageGame]):
        def _on_message(ws, message):
            msg = json.loads(message)
            # forward to observer
            ob.ft_update(msg)
            # notify done -> trainer listener
            if msg.get("type") == e_TYPE_MESSAGE.NOTIFICATION:
                noti = msg
                if noti.get("body", {}).get("status") == e_GAME_STATE.FINISH and self._listener:
                    self._listener.ft_update(True)

        def _on_error(ws, err):
            # Optional: log or escalate
            pass

        def _on_close(ws, code, reason):
            pass

        def _on_open(ws):
            pass

        self._ws = WebSocketApp(
            self._url,
            on_open=_on_open,
            on_message=_on_message,
            on_error=_on_error,
            on_close=_on_close
        )
        self._ws_thread = threading.Thread(target=self._ws.run_forever, daemon=True)
        self._ws_thread.start()
        return self._ws  # parity with TS: return socket-like handle

    def ft_listenWhenDone(self, ob: Observer[bool]) -> None:
        self._listener = ob
