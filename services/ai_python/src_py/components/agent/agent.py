from __future__ import annotations
import json
import math
import random
from typing import Optional, List

import numpy as np
import tensorflow as tf

from src_py.utils.observable import Observer, Subject
from src_py.components.game.game import PongGame
from src_py.types.t_game import (
    AgentConfig, MessageGame, StateNotificationMsg, StateResponseMsg, PlayerTag
)
from src_py.constants.constants import (
    e_ACTION, e_GAME_STATE, e_PLAYER_STATE, e_TYPE_MESSAGE, e_REWARD, e_TAG_PLAYER, PARAMS, e_GAME_CONSTANTS
)
from src_py.components.dqn.dqn import Dqn
from src_py.components.replay_memory.replay_memory import ReplayMemory

class PongAgent:
    def __init__(self, game: PongGame, config: AgentConfig):
        self.game: PongGame = game
        self.config: AgentConfig = config
        self._listener: Optional[Observer[bool]] = None

        diff = (config.epsilon_final - config.epsilon_init)
        self.epsilon_final = config.epsilon_final
        self.epsilon_init = config.epsilon_init
        self.epsilon_increment = diff / config.epsilon_decay_frames
        self.epsilon_decay_frames = config.epsilon_decay_frames

        self.online_network = Dqn.ft_createMLP(3)
        self.target_network = Dqn.ft_createMLP(3)
        self.target_network.trainable = False

        self.optimizer = tf.keras.optimizers.Adam(learning_rate=config.learning_rate)
        self.replay_memory = ReplayMemory(config.replay_buffer_size)

        self.frame_count: int = 0
        self.cumulative_reward: float = 0.0
        self.epsilon: float = 0.05
        self.hits_counter: int = 0

        self.last_state: Optional[StateResponseMsg] = None
        self.last_action: e_ACTION = e_ACTION.IDLE

        self.socket = None
        self.pendule_flag = False
        self.scored = False

        # Observers
        def _observer_fn(msg: MessageGame):
            t = msg.get("type")
            if t == e_TYPE_MESSAGE.NOTIFICATION:
                self.ft_handleNotificationMsg(msg)  # type: ignore
            elif t == e_TYPE_MESSAGE.STATE_RESPONSE:
                self.ft_handleStateResponseMsg(msg)  # type: ignore
        self.observer = Observer[MessageGame](_observer_fn)

        self.subject_frame_counter: Subject[int] = Subject()

    def ft_reset(self) -> None:
        self.cumulative_reward = 0.0
        self.hits_counter = 0
        self.last_state = None
        self.last_action = e_ACTION.IDLE
        self.scored = False

    def ft_resetEpisode(self) -> None:
        self.cumulative_reward = 0.0
        self.hits_counter = 0
        self.scored = False
        self.last_action = e_ACTION.IDLE
        self.last_state = None

    def ft_handleNotificationMsg(self, msg: StateNotificationMsg) -> None:
        body = msg["body"]
        if body["status"] == e_GAME_STATE.START:
            if self.socket:
                self.socket.send(json.dumps({
                    "type": e_TYPE_MESSAGE.STATUS_REQUEST,
                    "body": {"status": e_PLAYER_STATE.READY}
                }))
        #if body["status"] == e_GAME_STATE.FINISH:
        #    reward = self.ft_getReward(msg)
        #    self.cumulative_reward += reward
        #    if self.last_state is not None:
        #        self.replay_memory.ft_append({
        #            "state": self.last_state,
        #            "action": e_ACTION.IDLE,
        #            "reward": reward,
        #            "done": True,
        #            "next_state": self.last_state
        #        })

    def _ft_getRandomAction(self, msg: StateResponseMsg) -> e_ACTION:
        r = random.random()
        if r < (1/3):
            return e_ACTION.UP
        elif r < (2/3):
            return e_ACTION.DOWN
        else:
            return e_ACTION.IDLE

    def _ft_step(self, state_tensor: tf.Tensor, msg: StateResponseMsg) -> e_ACTION:
        self.epsilon = self.epsilon_final if self.frame_count >= self.epsilon_decay_frames \
            else self.epsilon_init + self.epsilon_increment * self.frame_count
        self.frame_count += 1
        self.subject_frame_counter.ft_notify(self.frame_count)

        if random.random() < self.epsilon:
            return self._ft_getRandomAction(msg)
        else:
            q = self.online_network(state_tensor, training=False)  # [B, 3]
            action = int(tf.argmax(q, axis=-1).numpy()[0])
            return e_ACTION(action)

    def _ft_getTags(self, msg: MessageGame) -> PlayerTag:
        adv = e_TAG_PLAYER.TWO if msg["tag"] == e_TAG_PLAYER.ONE else e_TAG_PLAYER.ONE
        return {"my_tag": msg["tag"], "adv_tag": adv}

    def ft_getReward(self, msg: MessageGame) -> e_REWARD:
        t = msg.get("type")
        reward_base = e_REWARD.SURVIVAL
        #if t == e_TYPE_MESSAGE.NOTIFICATION:
        #    payload = msg["body"].get("payload")
        #    if msg["body"]["status"] == e_GAME_STATE.FINISH and msg["tag"] != payload.get("winner"):
        #        return (reward_base + e_REWARD.LOSER)
        #elif t == e_TYPE_MESSAGE.STATE_RESPONSE:
        if t == e_TYPE_MESSAGE.STATE_RESPONSE:
            if self.last_state is None:
                return e_REWARD.NO_REWARD
            st_msg = msg
            player_tags = self._ft_getTags(msg)
            ball = st_msg["body"]["ball"]
            myself = st_msg["body"]["players"][player_tags["my_tag"]]
            # contact / miss reward near right bound
            if abs(ball["pos_x"] - PARAMS["rigth_bound"]) <= PARAMS["epsilon"]:
                discriminant = abs(ball["pos_y"] - myself["pos_y"]) - PARAMS["delta_y"]
                if discriminant < 0:
                    self.hits_counter += 1
                    if self.hits_counter % 5 == 0:
                        reward_long_ralies = (e_REWARD.HIT_BALL * (self.hits_counter / 5))
                    else:
                        reward_long_ralies = e_REWARD.NO_REWARD
                    return (reward_base + e_REWARD.HIT_BALL + reward_long_ralies)
                else:
                    max_discriminant = e_GAME_CONSTANTS.HEIGHT - e_GAME_CONSTANTS.RACQUET 
                    reward_reduce_impact = (1 - (discriminant / max_discriminant)) * e_REWARD.REDUCE_IMPACT
                    self.scored = True
                    return (reward_base + e_REWARD.OP_SCORES + reward_reduce_impact)
            return (reward_base + e_REWARD.MV_WRONG)
        return (reward_base + e_REWARD.NO_REWARD)

    def ft_handleStateResponseMsg(self, msg: StateResponseMsg) -> None:
        # tf.tidy analogue is automatic in eager; keep tensor lifetimes short.
        if len(msg["body"]["players"]) < 2:
            return
        state_tensor = self.game.ft_getStateTensorMLP([msg])  # shape [1, H, W, C]
        action = self._ft_step(state_tensor, msg)
        reward = e_REWARD.NO_REWARD
        if self.last_state is not None:
            reward = self.ft_getReward(msg)
            #Set done depending on scored, trying to look for smaller Markov Chains. When the opponent scores.
            self.replay_memory.ft_append({
                "state": self.last_state,
                "action": self.last_action,
                "reward": reward,
                "done": self.scored,
                "next_state": msg
            })
        self.cumulative_reward += reward
        #[PENDING][URGENT]: In case we don't find an stability in the model, try striking it off with cumulative_reward > 40 to finish episode.
        if self.scored == True:
            self._listener.ft_update(True)
        else:
            self.last_state = msg
            self.last_action = action
            if self.socket:
                self.socket.send(json.dumps({
                    "type": e_TYPE_MESSAGE.STATE_REQUEST,
                    "body": {"player": {"action": int(action)}}
                }))

    def ft_trainOnReplayBatch(self, batch_sz: int, gamma: float) -> None:
        batch = self.replay_memory.ft_sample(batch_sz)
        if not batch:
            return

        # Build tensors
        state_msgs: List[StateResponseMsg] = [rp["state"] for rp in batch]
        next_state_msgs: List[StateResponseMsg] = [rp["next_state"] for rp in batch]
        st_tensor = self.game.ft_getStateTensorMLP(state_msgs)           # [B,H,W,C]
        nx_tensor = self.game.ft_getStateTensorMLP(next_state_msgs)      # [B,H,W,C]
        action_tensor = tf.convert_to_tensor([int(rp["action"]) for rp in batch], dtype=tf.int32)  # [B]
        reward_tensor = tf.convert_to_tensor([float(rp["reward"]) for rp in batch], dtype=tf.float32)  # [B]
        done_tensor = tf.convert_to_tensor([1.0 if rp["done"] else 0.0 for rp in batch], dtype=tf.float32)  # [B]

        num_actions = 3

        with tf.GradientTape() as tape:
            q_online = self.online_network(st_tensor, training=True)  # [B,3]
            # Gather Q(s,a)
            action_one_hot = tf.one_hot(action_tensor, num_actions, dtype=tf.float32)  # [B,3]
            qs = tf.reduce_sum(q_online * action_one_hot, axis=-1)  # [B]

            q_target_next = self.target_network(nx_tensor, training=False)  # [B,3]
            max_q_next = tf.reduce_max(q_target_next, axis=-1)  # [B]
            done_mask = 1.0 - done_tensor  # 1 for non-terminal
            target_q = reward_tensor + gamma * max_q_next * done_mask  # [B]

            loss = tf.reduce_mean(tf.square(target_q - qs))

        grads = tape.gradient(loss, self.online_network.trainable_variables)
        self.optimizer.apply_gradients(zip(grads, self.online_network.trainable_variables))
        # Optional: print/debug
        # print(f"Loss: {loss.numpy():.6f}")

    def ft_isReplayMemoryFilled(self) -> bool:
        return self.replay_memory.appended >= self.replay_memory.max_len


    def ft_listenWhenDoneEpisode(self, ob: Observer[bool]) -> None:
        self._listener = ob

    def ft_connectGame(self) -> None:
        self.socket = self.game.ft_subscribeToSocket(self.observer)
        if self.socket is None:
            raise RuntimeError("The connection with the game server couldn't be reached.")
