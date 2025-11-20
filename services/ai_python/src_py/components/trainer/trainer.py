import os
import csv
import time
from datetime import datetime

from src_py.components.game.game import PongGame
from src_py.components.agent.agent import PongAgent
from src_py.utils.observable import Observer
from src_py.types.t_game import AgentConfig
from src_py.constants.constants import e_TAG_PLAYER
from src_py.components.dqn.dqn import Dqn

class Trainer:
    def __init__(self, config_without_tag: dict, csv_path: str = "runs/train_log.csv"):
        # timing
        self.t0 = time.time()
        self.t_prev_ms = int(self.t0 * 1000)

        # counters & trackers
        self.fc_prev = {"one": 0, "two": 0}
        self.avg_reward_best = float("-inf")
        self.baseurl_game = "ws://localhost:3000/v1/train/"  # tip: ws:// for websocket-client
        self.game_counter = 1
        self.game = PongGame(f"{self.baseurl_game}{self.game_counter}")

        cfg = AgentConfig(tag=e_TAG_PLAYER.TWO, **config_without_tag)
        self.ag_two = PongAgent(self.game, cfg)

        self.averager_two = [0.0 for _ in range(100)]
        self.sync_frames = int(2e4)
        self.episodes = 0

        # CSV setup
        self.csv_path = csv_path
        os.makedirs(os.path.dirname(self.csv_path) or ".", exist_ok=True)
        if not os.path.exists(self.csv_path):
            with open(self.csv_path, "w", newline="") as f:
                w = csv.writer(f)
                w.writerow([
                    "t_wall_iso",           # wall-clock timestamp (ISO 8601)
                    "t_elapsed_s",          # seconds since training start
                    "frame_ag_two",
                    "cumulativeRewardAgent",
                    "cumulativeRewardAverage_two",
                    "epsilon_two",
                    "hits_counter",
                    "episodes"
                ])

        def _listener_episode(is_done: bool):
            if not is_done:
                return
            self.episodes += 1
            # update averages and maybe save best
            self.ft_appendAverager(self.ag_two.cumulative_reward, self.averager_two)
            average_two = self.ft_average(self.averager_two)

            if average_two > self.avg_reward_best:
                self.avg_reward_best = average_two
                os.makedirs("src_py/model", exist_ok=True)
                self.ag_two.online_network.save("src_py/model/agent_two.keras")
                print("Online Network saved")

            # console print (unchanged)
            print(f"""
                Frame_ag_two: {self.ag_two.frame_count}
                cumulativeRewardAgent: {self.ag_two.cumulative_reward}
                cummulativeRewardAverage_two: {average_two}
                epsilon_two: {self.ag_two.epsilon:.3f}
                hits_counter: {self.ag_two.hits_counter}
                episodes: {self.episodes}
                """)

            # === CSV logging (one row per finished episode) ===
            t_now = time.time()
            with open(self.csv_path, "a", newline="") as f:
                w = csv.writer(f)
                w.writerow([
                    datetime.fromtimestamp(t_now).isoformat(timespec="seconds"),
                    round(t_now - self.t0, 3),
                    int(self.ag_two.frame_count),
                    float(self.ag_two.cumulative_reward),
                    float(average_two),
                    float(self.ag_two.epsilon),
                    int(self.ag_two.hits_counter),
                    int(self.episodes)
                ])


            # 💾 Checkpoint every 50 episodes
            if self.episodes % 250 == 0:
                ckpt_path = f"src_py/model/checkpoint_ep{self.episodes / 250}.keras"
                self.ag_two.online_network.save(ckpt_path)
                print(f"Checkpoint saved at {ckpt_path}")
            self.ag_two.ft_resetEpisode()

        def _listener(is_done: bool):
            if not is_done:
                return
            # (optional) switch game instance url as in your TS code
            self.game.url = f"{self.baseurl_game}{self.game_counter}"
            self.game.ft_reset()
            # reset & reconnect
            self.ag_two.ft_reset()
            self.ag_two.ft_connectGame()

        self.listener = Observer[bool](_listener)
        self.listener_episode = Observer[bool](_listener_episode)
        self.game.ft_listenWhenDone(self.listener)
        self.ag_two.ft_listenWhenDoneEpisode(self.listener_episode)

    def ft_train(self):
        self.ag_two.ft_connectGame()

        def _on_frame(frame_count: int):
            if self.ag_two.ft_isReplayMemoryFilled():
                #start = time.time()  # current time in seconds
                #print(f"Start: {start}")
                if frame_count % 10 == 0:
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
