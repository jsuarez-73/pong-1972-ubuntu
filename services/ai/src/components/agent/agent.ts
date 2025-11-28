import { Observer, Subject } from "@segfaultx/observable";
import { PongGame } from "../game/game";
import { AgentConfig, e_GAME_STATE, MessageGame, PlayerTag, StateNotificationMsg, StateResponseMsg } from "@core/types/t_game";
import { e_ACTION, e_GAME_CONSTANTS, e_PLAYER_STATE, e_REWARD, e_TAG_PLAYER, e_TYPE_MESSAGE, PARAMS } from "@core/constants/constants";
import * as Tf from "@tensorflow/tfjs-node";
import { Dqn } from "../dqn/dqn";
import { ReplayMemory } from "../replay-memory/replay_memory";

export class	PongAgent {

	public	game: PongGame;
	public	online_network: Tf.Sequential;
	public	target_network: Tf.Sequential;
	public	frame_count: number = 0;
	public	cumulative_reward: number = 0;
	public	epsilon: number = 0.01;
	public	config: AgentConfig;
	public	hits_counter = 0;

	private	last_state: StateResponseMsg | undefined;
	private	last_action: e_ACTION = e_ACTION.IDLE;
	private	optimizer: Tf.Optimizer;
	private	replay_memory: ReplayMemory;
	private	epsilon_increment: number;
    private epsilon_decay_frames: number;
    private epsilon_final: number;
	private	epsilon_init: number;
	private	scored: boolean = false;
	private	socket: WebSocket | undefined;
	private	listener?: Observer<boolean>;
	private	observer: Observer<MessageGame> = new Observer(async (msg: MessageGame) => {
		switch (msg.type) {
			case e_TYPE_MESSAGE.NOTIFICATION:
				this.ft_handleNotificationMsg(msg as StateNotificationMsg);
				return ;
			case e_TYPE_MESSAGE.STATE_RESPONSE:
				this.ft_handleStateResponseMsg(msg as StateResponseMsg);
				return ;
			default:
				return ;
		}
	});
	public	subject_frame_counter: Subject<number> = new Subject();

	constructor (
		game: PongGame,
		config: AgentConfig
	) {
		this.config = config;
		this.game = game;
		const	diff = (config.epsilon_final - config.epsilon_init);
        this.epsilon_final = config.epsilon_final;
        this.epsilon_init = config.epsilon_init;
        this.epsilon_increment =  diff / config.epsilon_decay_frames;
        this.epsilon_decay_frames = config.epsilon_decay_frames;
		this.online_network = Dqn.ft_createMLP(3);
		this.target_network = Dqn.ft_createMLP(3);
		this.target_network.trainable = false;
		this.optimizer = Tf.train.adam(config.learning_rate);
		this.replay_memory = new ReplayMemory(config.replay_buffer_size);
	}

	public	ft_reset(): void {
		this.cumulative_reward = 0;
		this.hits_counter = 0;
		this.last_state = undefined;
		this.last_action = e_ACTION.IDLE;
	}

	public	ft_resetEpisode(): void {
		this.ft_reset();
		this.scored = false;
	}

	private	ft_handleNotificationMsg(msg: StateNotificationMsg): void {
		if (msg.body.status == e_GAME_STATE.START) {
			if (this.socket?.readyState) {
				this.socket?.send(JSON.stringify(
					{
						type: e_TYPE_MESSAGE.STATUS_REQUEST,
						body: {
							status: e_PLAYER_STATE.READY
						}
					}
				));
			}
		}
	}

	private	ft_getRandomAction(): e_ACTION {
		const	random = Math.random();
		if (random < (1/3))
			return (e_ACTION.UP);
		else if (random < (2/3))
			return (e_ACTION.DOWN);
		else
			return (e_ACTION.IDLE);
	}

	private	ft_step(state: Tf.Tensor): e_ACTION {
        this.epsilon = this.frame_count >= this.epsilon_decay_frames
            ? this.epsilon_final
            : this.epsilon_init + this.epsilon_increment * this.frame_count;
		this.frame_count++;
		this.subject_frame_counter.ft_notify(this.frame_count)
		if (Math.random() < this.epsilon) {
			return (this.ft_getRandomAction());
		}
		else {
			const	tensor_prediction = this.online_network.predict(state);
			if (! (tensor_prediction instanceof Array))
				return (tensor_prediction.argMax(-1).dataSync()[0] ?? e_ACTION.IDLE);
			else
				return (e_ACTION.IDLE);
		}
	}

	private	ft_getReward(msg: MessageGame): e_REWARD {
		const	reward_base = e_REWARD.SURVIVAL;
		switch (msg.type) {
			case	e_TYPE_MESSAGE.STATE_RESPONSE:
				if (this.last_state == undefined)
					return (e_REWARD.NO_REWARD);
				const	st_msg = msg as StateResponseMsg;
				const	player_tags = this.ft_getTags(msg);
				const	ball = st_msg.body.ball;
				const	myself = st_msg.body.players[player_tags.my_tag]!;
				if (Math.abs(ball.pos_x - PARAMS.rigth_bound) <= PARAMS.epsilon) {
					const	discriminant = Math.abs(ball.pos_y - myself.pos_y) - PARAMS.delta_y;
					if (discriminant < 0) {
						this.hits_counter++;
						let	reward_long_ralies = e_REWARD.NO_REWARD;
						if (this.hits_counter % 5 == 0)
							reward_long_ralies = (e_REWARD.HIT_BALL * (this.hits_counter / 5));
						return (e_REWARD.HIT_BALL + reward_long_ralies + reward_base);
					}
					else {
						const	max_disc = e_GAME_CONSTANTS.HEIGHT - e_GAME_CONSTANTS.RACQUET;
						const	reward_rdimpact = ((1 - (discriminant / max_disc)) * e_REWARD.REDUCE_IMPACT);
						this.scored = true;
						return (e_REWARD.OP_SCORES + reward_rdimpact + reward_base);
					}
				}
				return (e_REWARD.MV_WRONG + reward_base);
			default:
				return (reward_base);
		}
	}

	private	ft_getTags(msg: MessageGame): PlayerTag {
		const	adv_tag = (msg.tag == e_TAG_PLAYER.ONE) ? e_TAG_PLAYER.TWO : e_TAG_PLAYER.ONE;
		return ({
			my_tag: msg.tag,
			adv_tag: adv_tag
		})
	}

	private	async	ft_handleStateResponseMsg(msg: StateResponseMsg): Promise<void> {
		let	action = e_ACTION.IDLE;
		Tf.tidy(() => {
			if (msg.body.players.length < 2)
				return ;
			const	tensor = this.game.ft_getStateTensorMLP([msg]);
			action = this.ft_step(tensor);
		});
		let	reward: e_REWARD = e_REWARD.NO_REWARD;
		if (this.last_state != undefined) {
			reward = this.ft_getReward(msg);
			this.replay_memory.ft_append({
				state: this.last_state,
				action: this.last_action,
				reward: reward,
				done: this.scored,
				next_state: msg
			});
		}
		this.cumulative_reward += reward;
		if (this.scored) {
			this.scored = false;
			await this.listener?.ft_update(true);
		}
		else {
			this.last_state = msg;
			this.last_action = action;
			if (this.socket?.readyState) {
				this.socket?.send(JSON.stringify({
					type: e_TYPE_MESSAGE.STATE_REQUEST,
					body: {
						player: {
							action: action
						}
					}
				}));
			}
		}
	}

	public	ft_trainOnReplayBatch(batch_sz: number, gamma: number): void {
		const	batch = this.replay_memory.ft_sample(batch_sz);
		const	loss_function = () => {
			return (Tf.tidy(() => {
				const	state_msgs = batch.map(rp => rp.state);
				const	nxst_tensor = this.game.ft_getStateTensorMLP(batch.map(rp => rp.next_state));
				const	st_tensor = this.game.ft_getStateTensorMLP(state_msgs);
				const	action_tensor = Tf.tensor1d(batch.map(rp => rp.action), "int32");
				const	out = this.online_network.apply(st_tensor, {training: true}) as Tf.Tensor;
				const	qs = out.mul(Tf.oneHot(action_tensor, 3)).sum(-1);
				const	reward_tensor = Tf.tensor1d(batch.map(rp => rp.reward));
				const	out_target = this.target_network.predict(nxst_tensor) as Tf.Tensor;
				const	nxst_max_q_tensor = out_target.max(-1);
				const	done_tensor = Tf.tensor1d(batch.map(rp => rp.done)).asType("float32");
				const	done_mask = Tf.scalar(1).sub(done_tensor);
				const	target_qs = reward_tensor.add(nxst_max_q_tensor.mul(done_mask).mul(gamma));
				const	mean = Tf.losses.meanSquaredError(target_qs, qs) as Tf.Scalar;
				//console.log(`Mean from target_qs and qs ${mean}`);
				return (mean);
			}));
		};
		const	grads = Tf.variableGrads(loss_function);
		this.optimizer.applyGradients(grads.grads);
		//console.log(`Gradients updated`);
		Tf.dispose(grads);
	}

	public	ft_isReplayMemoryFilled(): boolean {
		return (this.replay_memory.appended >= this.replay_memory.max_len);
	}

	public	ft_listenWhenDoneEpisode(ob: Observer<boolean>): void {
		this.listener = ob;
	}

	public	ft_connectGame(): void {
		this.socket = this.game.ft_subscribeToSocket(this.observer);
		if (this.socket == undefined)
			throw (new Error("The connection with the game server couldn't be reached."));
	}
}
