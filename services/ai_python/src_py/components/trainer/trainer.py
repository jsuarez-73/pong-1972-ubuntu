import os
import time
from datetime import datetime
from src_py.components.game.game import PongGame
from src_py.components.agent.agent import PongAgent
from src_py.utils.observable import Observer
from src_py.types.t_game import AgentConfig
from src_py.constants.constants import e_TAG_PLAYER
from src_py.components.dqn.dqn import Dqn

class Trainer:
    def __init__(self, config_without_tag: dict):
        self.t_prev = int(datetime.now().timestamp() * 1000)
        self.fc_prev = {"one": 0, "two": 0}
        self.avg_reward_best = float("-inf")
        self.baseurl_game = "ws://localhost:3000/v1/train/"  # tip: ws:// for websocket-client
        self.game_counter = 1
        self.game = PongGame(f"{self.baseurl_game}{self.game_counter}")

        cfg = AgentConfig(tag=e_TAG_PLAYER.TWO, **config_without_tag)
        self.ag_two = PongAgent(self.game, cfg)

        self.averager_two = [0.0 for _ in range(100)]
        self.sync_frames = int(1e3)
        self.episodes = 0

        def _listener(is_done: bool):
            if is_done:
                self.episodes += 1
                # reconnect to next game (mirroring TS)
                self.game.url = f"{self.baseurl_game}{self.game_counter}"
                self.game.ft_reset()

                self.ft_appendAverager(self.ag_two.cumulative_reward, self.averager_two)
                average_two = self.ft_average(self.averager_two)

                if average_two > self.avg_reward_best:
                    self.avg_reward_best = average_two
                    os.makedirs("src/model", exist_ok=True)
                    self.ag_two.online_network.save("src/model/agent_two.keras")
                    print("Online Network saved")

                print(f"""Frame_ag_two: {self.ag_two.frame_count}
                    cumulativeRewardAgent: {self.ag_two.cumulative_reward}
                    cummulativeRewardAverage_two: {average_two}
                    epsilon_two: {self.ag_two.epsilon:.3f}
                    hits_counter: {self.ag_two.hits_counter}
                    episodes: {self.episodes}
                    """)
                self.ag_two.ft_reset()
                self.ag_two.ft_connectGame()

        self.listener = Observer[bool](_listener)
        self.game.ft_listenWhenDone(self.listener)

    def ft_train(self):
        self.ag_two.ft_connectGame()
        def _on_frame(frame_count: int):
            if self.ag_two.ft_isReplayMemoryFilled():
                #start = time.time()  # current time in seconds
                #print(f"Start: {start}")
                self.ag_two.ft_trainOnReplayBatch(128, 0.99)
                #end = time.time()
                #print(f"End: {end}, diff: {end - start}")
                if frame_count % self.sync_frames == 0:
                    Dqn.ft_copyWeights(self.ag_two.target_network, self.ag_two.online_network)
                    print("Sync'ed weights from online network to target network agent_two")

        self.ag_two.subject_frame_counter.ft_subscribe(Observer(_on_frame))

    @staticmethod
    def ft_appendAverager(avg: float, averager: list[float]) -> None:
        averager.pop(0)
        averager.append(avg)

    @staticmethod
    def ft_average(averager: list[float]) -> float:
        return sum(averager) / len(averager) if averager else 0.0
