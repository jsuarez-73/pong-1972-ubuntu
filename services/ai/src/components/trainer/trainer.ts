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
	private	baseurl_game = "http://192.168.1.15:3000/v1/train/";
	private	game_counter = 1;
	private	game: PongGame = new PongGame(`${this.baseurl_game}${this.game_counter}`);
	private	ag_one: PongAgent;
	private	ag_two: PongAgent;
	private is_updating_one: boolean = false;
	private is_updating_two: boolean = false;
	private	averager_one: number[] = new Array(100).fill(0);
	private	averager_two: number[] = new Array(100).fill(0);
	private	sync_frames: number = 1e3;
	private	listener: Observer<{is_done: boolean, tag: e_TAG_PLAYER}> = new Observer(async (agentGameDone) => {
		if (agentGameDone.is_done) {
			this.game.url = `${this.baseurl_game}${this.game_counter}`;
			/*[PENDING]: Try without increment game_counter.*/
			this.game.ft_reset();
			if (agentGameDone.tag == e_TAG_PLAYER.ONE)
				this.ft_resetPlayerOne();
			if (agentGameDone.tag == e_TAG_PLAYER.TWO)
				this.ft_resetPlayerTwo();
		}
	});

	constructor(config: Omit<AgentConfig, "tag">) {
		this.game.ft_listenWhenDone(this.listener);
		this.ag_one = new PongAgent(this.game, {tag: e_TAG_PLAYER.ONE, ...config});
		this.ag_two = new PongAgent(this.game, {tag: e_TAG_PLAYER.TWO, ...config});
	}

	private async ft_resetPlayerOne() {
		this.ft_appendAverager(this.ag_one.cumulative_reward, this.averager_one);
		const	average_one = this.ft_average(this.averager_one);
		//if ( average_one > this.avg_reward_best)
		//	await this.ag_one.online_network.save("file://src/model/agent_one.model");
		console.log(`Frame_ag_one: ${this.ag_one.frame_count}\n
					cummulativeReward_one: ${average_one}\n
					epsilon_one: ${this.ag_one.epsilon.toFixed(3)}\n
					`);
					/*[PENDING][PINNED][URGENT]: Train the model with Camilo and
					* make sure the hyperparameters are correct.*/
		this.ag_one.ft_reset();
		this.ag_one.ft_connectGame();
	}

	private async ft_resetPlayerTwo() {
		this.ft_appendAverager(this.ag_two.cumulative_reward, this.averager_two);
		const	average_two = this.ft_average(this.averager_two);
		//if (average_two > this.avg_reward_best)
		//	await this.ag_two.online_network.save("file://src/model/agent_two.model");
		console.log(`Frame_ag_two: ${this.ag_two.frame_count}\n
					cummulativeReward_two: ${average_two}\n
					epsilon_two: ${this.ag_two.epsilon.toFixed(3)}\n
					`);
					/*[PENDING][PINNED][URGENT]: Train the model with Camilo and
					* make sure the hyperparameters are correct.*/
		this.ag_two.ft_reset();
		this.ag_two.ft_connectGame();
	}

	public async	ft_train() {
		this.ag_one.ft_connectGame();
		this.ag_two.ft_connectGame();
		setInterval(() => {
			if (this.ag_one.ft_isReplayMemoryFilled() && this.ag_two.ft_isReplayMemoryFilled()) {
				this.ag_one.ft_trainOnReplayBatch(64, 0.99);
				this.ag_two.ft_trainOnReplayBatch(64, 0.99);
				if (this.ag_one.frame_count % this.sync_frames == 0 && !this.is_updating_one) {
					this.is_updating_one = true;
					Dqn.ft_copyWeights(this.ag_one.target_network, this.ag_one.online_network);
					console.log('Sync\'ed weights from online network to target network agent_one');
					this.is_updating_one = false;
				}
				if (this.ag_two.frame_count % this.sync_frames == 0 && !this.is_updating_two) {
					this.is_updating_two = true;
					Dqn.ft_copyWeights(this.ag_two.target_network, this.ag_two.online_network);
					console.log('Sync\'ed weights from online network to target network agent_two');
					this.is_updating_two = false;
				}
			}
		}, 100);
	}

	private	ft_appendAverager(avg: number, averager: number[]): void {
		averager.shift();
		averager.push(avg);
	}

	private	ft_average(averager: number[]): number {
		return (averager.reduce((current, prev) => current + prev) / averager.length);
	}
}
