import { PongGame } from "@components/game/game";
import { PongAgent } from "@components/agent/agent";
import { Observer } from "@segfaultx/observable";
import { AgentConfig } from "@core/types/t_game";
import { e_TAG_PLAYER } from "@core/constants/constants";
import { Dqn } from "../dqn/dqn";
import { access, constants, FileHandle, open } from "node:fs/promises"

export class	Trainer {

	private	avg_reward_best = -Infinity;
	private	baseurl_game = "http://localhost:3000/v1/train/";
	private	game_counter = 1;
	private	game: PongGame = new PongGame(`${this.baseurl_game}${this.game_counter}`);
	private	agent: PongAgent;
	private	averager: number[] = new Array(100).fill(0);
	private	sync_frames: number = 2e4;
	private	csv_path = "runs/train_log.csv";
	private	file_handle?: FileHandle;
	private	episodes: number = 0;
	private	listener_episode: Observer<boolean> = new Observer(async (is_done: boolean) => {
		if (! is_done)
			return ;
		this.episodes++;
		this.ft_appendAverager(this.agent.cumulative_reward, this.averager);
		const	average = this.ft_average(this.averager);
		if (average > this.avg_reward_best) {
			this.avg_reward_best = average;
			await this.agent.online_network.save("file://model/agent.model");
			console.log(`Online Network saved`);
		}
		console.log(`Frame_agent: ${this.agent.frame_count}\n
					cumulativeRewardAgent: ${this.agent.cumulative_reward}\n
					cummulativeRewardAverage_two: ${average}\n
					epsilon_two: ${this.agent.epsilon.toFixed(3)}\n
					hits_counter: ${this.agent.hits_counter}\n
					episodes: ${this.episodes}\n
					`);
		let	log = `${Date.now()},`;
			log += `${this.agent.frame_count},`;
			log += `${this.agent.cumulative_reward},`;
			log += `${average},`;
			log += `${this.agent.epsilon},`;
			log += `${this.agent.hits_counter},`;
			log += `${this.episodes}`;
		await this.file_handle?.write(`${log}\n`);
		if (this.episodes % 250 == 0) {
			const	episode_cycle = this.episodes / 250;
			await this.agent.online_network.save(`file://model/checkpoint_ep${episode_cycle}.model`);
			console.log(`Checkpoint ${episode_cycle} saved.`);
		}
		this.agent.ft_resetEpisode();
	});
	private	listener: Observer<boolean> = new Observer(async (is_done: boolean) => {
		if (! is_done)
			return ;
		this.game.url = `${this.baseurl_game}${this.game_counter}`;
		this.game.ft_reset();
		this.agent.ft_reset();
		this.agent.ft_connectGame();
	});

	constructor(config: Omit<AgentConfig, "tag">) {
		this.game.ft_listenWhenDone(this.listener);
		this.agent = new PongAgent(this.game, {tag: e_TAG_PLAYER.TWO, ...config});
		this.agent.ft_listenWhenDoneEpisode(this.listener_episode);
	}

	public	async	ft_build_trainer(): Promise<void> {
		try {
			await access(this.csv_path, constants.W_OK);
		}
		catch (_error) {
			this.file_handle = await open(this.csv_path, "a");
			/*[PENDING][PINNED][URGENT]: Finish with the writing for the columns in the csv.
					* and then implement the append each log when an episode finish in the listener_episode.*/
					/*[PENDING][URGENT]: The agent is not working well. debug it!!!!!!*/
			let	columns = "t_elapsed_s,";
			columns += "frame,";
			columns += "cumulativeRewardAgent,";
			columns += "cumulativeRewardAverage,";
			columns += "epsilon,";
			columns += "hits_counter,";
			columns += "episodes";
			this.file_handle.write(`${columns}\n`);
		}
	}

	public async	ft_train() {
		this.agent.ft_connectGame();
		this.agent.subject_frame_counter.ft_subscribe(new Observer((frame_count) => {
			if (this.agent.ft_isReplayMemoryFilled()) {
//				const	start = Date.now();
//				console.log(`Start: ${start}`);
				if (frame_count % 10 == 0)
					this.agent.ft_trainOnReplayBatch(128, 0.99);
//				const	end = Date.now();
//				console.log(`End: ${end}, diff: ${end - start}`);
				if (frame_count % this.sync_frames == 0) {
					Dqn.ft_copyWeights(this.agent.target_network, this.agent.online_network);
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
