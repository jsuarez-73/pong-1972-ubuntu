import { PongGame } from "@components/game/game";
import { PongAgent } from "@components/agent/agent";
import { Observer } from "@segfaultx/observable";
import { AgentConfig } from "@core/types/t_game";
import { e_TAG_PLAYER } from "@core/constants/constants";
import { Dqn } from "../dqn/dqn";

export class	Trainer {

	private	t_prev = new Date().getTime();
	private	fc_prev = {
		one: 0,
		two: 0
	};
	private	avg_reward_best = -Infinity;
	private	baseurl_game = "http://localhost:3000/v1/train/";
	private	game_counter = 1;
	private	game: PongGame = new PongGame(`${this.baseurl_game}${this.game_counter}`);
	private	ag_two: PongAgent;
	private	averager_two: number[] = new Array(100).fill(0);
	private	sync_frames: number = 1e3;
	private	episodes: number = 0;
	private	listener: Observer<boolean> = new Observer(async (is_done: boolean) => {
		if (is_done) {
			this.episodes++;
			this.game.url = `${this.baseurl_game}${this.game_counter}`;
			/*[PENDING]: Try without increment game_counter.*/
			this.game.ft_reset();
			this.ft_appendAverager(this.ag_two.cumulative_reward, this.averager_two);
			const	average_two = this.ft_average(this.averager_two);
			if (average_two > this.avg_reward_best) {
				this.avg_reward_best = average_two;
				await this.ag_two.online_network.save("file://src/model/agent_two.model");
				console.log(`Online Network saved`);
			}
			console.log(`Frame_ag_two: ${this.ag_two.frame_count}\n
						cumulativeRewardAgent: ${this.ag_two.cumulative_reward}\n
						cummulativeRewardAverage_two: ${average_two}\n
						epsilon_two: ${this.ag_two.epsilon.toFixed(3)}\n
						hits_counter: ${this.ag_two.hits_counter}\n
						episodes: ${this.episodes}\n
						`);
						/*[PENDING][PINNED][URGENT]: Train the model with Camilo and
						* make sure the hyperparameters are correct.*/
			this.ag_two.ft_reset();
			this.ag_two.ft_connectGame();
		}
	});

	constructor(config: Omit<AgentConfig, "tag">) {
		this.game.ft_listenWhenDone(this.listener);
		this.ag_two = new PongAgent(this.game, {tag: e_TAG_PLAYER.TWO, ...config});
	}

	public async	ft_train() {
		this.ag_two.ft_connectGame();
		this.ag_two.subject_frame_counter.ft_subscribe(new Observer((frame_count) => {
			if (this.ag_two.ft_isReplayMemoryFilled()) {
				const	start = Date.now();
				console.log(`Start: ${start}`);
				this.ag_two.ft_trainOnReplayBatch(128, 0.99);
				const	end = Date.now();
				console.log(`End: ${end}, diff: ${end - start}`);
				if (frame_count % this.sync_frames == 0) {
					Dqn.ft_copyWeights(this.ag_two.target_network, this.ag_two.online_network);
					console.log('Sync\'ed weights from online network to target network agent_two');
				}
			}
		}));
	}

	private	ft_appendAverager(avg: number, averager: number[]): void {
		averager.shift();
		averager.push(avg);
	}

	private	ft_average(averager: number[]): number {
		return (averager.reduce((current, prev) => current + prev) / averager.length);
	}
}
