import { Observer, Subject } from "@segfaultx/observable";
import { PongGame } from "../game/game";
import { AgentConfig, e_GAME_STATE, MessageGame, NotificationMsg, PlayerTag, StateNotificationMsg, StateResponseMsg } from "@core/types/t_game";
import { e_ACTION, e_ERROR_RESPONSE, e_GAME_CONSTANTS, e_PLAYER_STATE, e_REWARD, e_TAG_PLAYER, e_TYPE_MESSAGE, PARAMS } from "@core/constants/constants";
import * as Tf from "@tensorflow/tfjs-node-gpu";
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
	private	socket: WebSocket | undefined;
	private	pendule_flag: boolean = false;
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
		this.online_network = Dqn.ft_createDeepQNetwork(
			this.game.vsquares,
			this.game.hsquares,
			3
		);
		this.target_network = Dqn.ft_createDeepQNetwork(
			this.game.vsquares,
			this.game.hsquares,
			3
		);
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
		if (msg.body.status == e_GAME_STATE.FINISH) {
			const	reward = this.ft_getReward(msg);
			this.cumulative_reward += reward;
			if (this.last_state != undefined) {
				this.replay_memory.ft_append({
					state: this.last_state,
					action: e_ACTION.IDLE,
					reward: reward,
					done: true,
					next_state: this.last_state
				});
			}
		}
	}

	/*[PENDING][PINNED][URGENT]: Set this implementation to avoid the racquet being stacked on
	* the corners, this behavoiur doesn't allow the model an apporpiated training.*/
	private	ft_getRandomAction(msg: StateResponseMsg): e_ACTION {
		/*const	players_tag = this.ft_getTags(msg);
		const	myself = msg.body.players[players_tag.my_tag]!;
		const	is_top = (myself.pos_y + PARAMS.delta_y) == PARAMS.upper_bound;
		const	is_bottom = (myself.pos_y - PARAMS.delta_y) == PARAMS.lower_bound;*/
		const	random = Math.random();
		if (random < (1/3))
			return (e_ACTION.UP);
		else if (random < (2/3))
			return (e_ACTION.DOWN);
		else
			return (e_ACTION.IDLE);
		/*if (! this.pendule_flag && ! is_top)
			return (e_ACTION.UP);
		else if (! this.pendule_flag && is_top) {
			this.pendule_flag = true;
			return (e_ACTION.DOWN);
		}
		else if (this.pendule_flag && ! is_bottom) {
			return (e_ACTION.DOWN);
		}
		else if (this.pendule_flag && is_bottom) {
			this.pendule_flag = false;
			return (e_ACTION.UP);
		}
		else
			return (e_ACTION.IDLE);*/
	}

	private	ft_step(state: Tf.Tensor, msg: StateResponseMsg): e_ACTION {
        this.epsilon = this.frame_count >= this.epsilon_decay_frames
            ? this.epsilon_final
            : this.epsilon_init + this.epsilon_increment * this.frame_count;
		this.frame_count++;
		this.subject_frame_counter.ft_notify(this.frame_count)
		if (Math.random() < this.epsilon) {
			return (this.ft_getRandomAction(msg));
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
		switch (msg.type) {
			case	e_TYPE_MESSAGE.NOTIFICATION:
				const	noti_msg = msg as NotificationMsg;
				const	payload = noti_msg.body.payload;
				if (noti_msg.body.status == e_GAME_STATE.FINISH && noti_msg.tag != payload.winner)
					return (e_REWARD.LOSER);
				break ;
			case	e_TYPE_MESSAGE.STATE_RESPONSE:
				if (this.last_state == undefined)
					return (e_REWARD.NO_REWARD);
				const	st_msg = msg as StateResponseMsg;
				const	player_tags = this.ft_getTags(msg);
				const	ball = st_msg.body.ball;
				const	myself = st_msg.body.players[player_tags.my_tag]!;
				/*[PENDING][PINNED][URGENT]: Set the reward as a function of the distance between
				* the racquect and the ball, Thus the model could learn that be closer to the ball
				* is the properly way to play
				* Set also another way to save the online network when the game is done.*/
				if (Math.abs(ball.pos_x - PARAMS.rigth_bound) <= PARAMS.epsilon) {
					const	discriminant = Math.abs(ball.pos_y - myself.pos_y) - PARAMS.delta_y;
					//const	hole_space = e_GAME_CONSTANTS.HEIGHT - e_GAME_CONSTANTS.RACQUET;
					const	factor_reward = 1;//discriminant / hole_space;
					if (discriminant < 0) {
						this.hits_counter++;
						return (e_REWARD.HIT_BALL);
					}
					else
						return (factor_reward * e_REWARD.OP_SCORES);
				}
				/*if (st_msg.body.players[player_tags.my_tag]!.pos_y != last_pos_y)
					return (e_REWARD.MV_WRONG);*/
				return (e_REWARD.NO_REWARD);
			default:
				return (e_REWARD.NO_REWARD);
		}
		return (e_REWARD.NO_REWARD);
	}

	private	ft_getTags(msg: MessageGame): PlayerTag {
		const	adv_tag = (msg.tag == e_TAG_PLAYER.ONE) ? e_TAG_PLAYER.TWO : e_TAG_PLAYER.ONE;
		return ({
			my_tag: msg.tag,
			adv_tag: adv_tag
		})
	}

	private	ft_handleStateResponseMsg(msg: StateResponseMsg): void {
		/*[NOTE]: Tidy is used to free allocated memory in tensors as this one, to avoid
		* runs out of memories.*/
		Tf.tidy(() => {
			if (msg.body.players.length < 2)
				return ;
			const	tensor = this.game.ft_getStateTensor([msg]);
			const	action = this.ft_step(tensor, msg);
			let	reward: e_REWARD = e_REWARD.NO_REWARD;
			if (this.last_state != undefined) {
				reward = this.ft_getReward(msg);
				this.replay_memory.ft_append({
					state: this.last_state,
					action: this.last_action,
					reward: reward,
					done: false,
					next_state: msg
				});
			}
			this.cumulative_reward += reward;
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
		});
	}

	public	ft_trainOnReplayBatch(batch_sz: number, gamma: number): void {
		const	batch = this.replay_memory.ft_sample(batch_sz);
		/*[PENDING][PINNED][URGENT]: Test it.*/
		const	loss_function = () => {
			return (Tf.tidy(() => {
				const	state_msgs = batch.map(rp => rp.state);
				const	nxst_tensor = this.game.ft_getStateTensor(batch.map(rp => rp.next_state));
				const	st_tensor = this.game.ft_getStateTensor(state_msgs);
				const	action_tensor = Tf.tensor1d(batch.map(rp => rp.action), "int32");
				const	out = this.online_network.apply(st_tensor, {training: true}) as Tf.Tensor;
				const	qs = out.mul(Tf.oneHot(action_tensor, 3)).sum(-1);
				/*[PENDING]: Getting all rewards as 0.*/
				const	reward_tensor = Tf.tensor1d(batch.map(rp => rp.reward));
				const	out_target = this.target_network.predict(nxst_tensor) as Tf.Tensor;
				const	nxst_max_q_tensor = out_target.max(-1);
				const	done_tensor = Tf.tensor1d(batch.map(rp => rp.done)).asType("float32");
				const	done_mask = Tf.scalar(1).sub(done_tensor);
				const	target_qs = reward_tensor.add(nxst_max_q_tensor.mul(done_mask).mul(gamma));
				const	mean = Tf.losses.meanSquaredError(target_qs, qs) as Tf.Scalar;
				console.log(`Mean from target_qs and qs ${mean}`);
				return (mean);
			}));
		};
		const	grads = Tf.variableGrads(loss_function);
		this.optimizer.applyGradients(grads.grads);
		console.log(`Gradients updated`);
		Tf.dispose(grads);
	}

	public	ft_isReplayMemoryFilled(): boolean {
		return (this.replay_memory.appended >= this.replay_memory.max_len);
	}

	public	ft_connectGame(): void {
		this.socket = this.game.ft_subscribeToSocket(this.observer);
		if (this.socket == undefined)
			throw (new Error("The connection with the game server couldn't be reached."));
	}
}
