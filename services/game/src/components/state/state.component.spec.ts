import { PlayerState } from "@components/player-state/player-state.component";
import { e_BALL_ACTION, e_TAG_PLAYER } from "@game-types/enums";
import { GlobalState } from "@components/state/state.component";
import { PARAMS } from "@components/params/params.component";

const	reporter = {
	specStarted: async function(result: {fullName: string, description: string}) {
		console.log(`\n${result.description}`);
	}
};
jasmine.getEnv().addReporter(reporter);
jasmine.DEFAULT_TIMEOUT_INTERVAL = 2147483647;

describe("[GLOBAL-STATE]", function () {
	function	ft_iterateStates(steps: number, global: GlobalState): void {
		let	disc;
		for (let i = 0; i < steps; i++) {
			disc = global.ft_nextState();
			console.log(`[STATE]: ${JSON.stringify(global.ft_getMessageResponse().body.ball)}\t[DISC]: ${disc}\n`);
		}
	}

	function	ft_setPlayers(global_state: GlobalState, players: PlayerState[]): void {
//		global_state.ft_PlayerCommingIn();
//		global_state.ft_PlayerCommingIn();
		global_state.ft_getMessageResponse();
		global_state.ft_commitPlayerState(players[0], e_TAG_PLAYER.ONE);
		global_state.ft_commitPlayerState(players[1], e_TAG_PLAYER.TWO);
	}

	it("Player two bounce.", () => {
		PARAMS.ball_x_start = 129;
		PARAMS.ball_y_start = 2 * Math.sqrt(3);
		const	global_state = new GlobalState();
		const	players = [
			new PlayerState(e_TAG_PLAYER.ONE),
			new PlayerState(e_TAG_PLAYER.TWO)
		];
		players[0].pos_y = 0;
		players[1].pos_y = 0;
		ft_setPlayers(global_state, players);
		//ft_iterateStates(5, global_state);
		expect(global_state.ft_nextState()).toBe(e_BALL_ACTION.BOUNCE);
	});

	it("Player one bounce.", () => {
		PARAMS.ball_x_start = -129;
		PARAMS.ball_y_start = 2 * Math.sqrt(3);
		PARAMS.vel_x = -1;
		const	global_state = new GlobalState();
		const	players = [
			new PlayerState(e_TAG_PLAYER.ONE),
			new PlayerState(e_TAG_PLAYER.TWO)
		];
		ft_setPlayers(global_state, players);
		//ft_iterateStates(5, global_state);
		expect(global_state.ft_nextState()).toBe(e_BALL_ACTION.BOUNCE);
		console.log(`[STATE]: ${JSON.stringify(global_state.ft_getMessageResponse().body.ball)}\n`);
	});

	it("Player one score on Player two.", () => {
		PARAMS.ball_x_start = 129;
		PARAMS.ball_y_start = 2 * Math.sqrt(3);
		PARAMS.vel_x = 1;
		const	global_state = new GlobalState();
		const	players = [
			new PlayerState(e_TAG_PLAYER.ONE),
			new PlayerState(e_TAG_PLAYER.TWO, 20)
		];
		ft_setPlayers(global_state, players);
		//ft_iterateStates(5, global_state);
		expect(global_state.ft_nextState()).toBe(e_BALL_ACTION.SCORE_P1);
		console.log(`[STATE]: ${JSON.stringify(global_state.ft_getMessageResponse().body.ball)}\n`);
	});

	it("Player two score on Player one.", () => {
		PARAMS.ball_x_start = -129;
		PARAMS.ball_y_start = 2 * Math.sqrt(3);
		PARAMS.vel_x = -1;
		const	global_state = new GlobalState();
		const	players = [
			new PlayerState(e_TAG_PLAYER.ONE, 20),
			new PlayerState(e_TAG_PLAYER.TWO)
		];
		ft_setPlayers(global_state, players);
		//ft_iterateStates(5, global_state);
		expect(global_state.ft_nextState()).toBe(e_BALL_ACTION.SCORE_P2);
		console.log(`[STATE]: ${JSON.stringify(global_state.ft_getMessageResponse().body.ball)}\n`);
	});

	it("Ball bounce in the upper_bound", () => {
		PARAMS.ball_x_start = 0;
		PARAMS.ball_y_start = 75;
		PARAMS.vel_x = 1;
		PARAMS.vel_y = Math.sqrt(3);
		const	global_state = new GlobalState();
		const	players = [
			new PlayerState(e_TAG_PLAYER.ONE),
			new PlayerState(e_TAG_PLAYER.TWO)
		];
		ft_setPlayers(global_state, players);
		//ft_iterateStates(5, global_state);
		expect(global_state.ft_nextState()).toBe(e_BALL_ACTION.BOUNCE);
		console.log(`[STATE]: ${JSON.stringify(global_state.ft_getMessageResponse().body.ball)}\n`);
	});

	it("Ball bounce in the lower_bound", () => {
		PARAMS.ball_x_start = 0;
		PARAMS.ball_y_start = -75;
		PARAMS.vel_x = 1;
		PARAMS.vel_y = -Math.sqrt(3);
		const	global_state = new GlobalState();
		const	players = [
			new PlayerState(e_TAG_PLAYER.ONE),
			new PlayerState(e_TAG_PLAYER.TWO)
		];
		ft_setPlayers(global_state, players);
		//ft_iterateStates(5, global_state);
		expect(global_state.ft_nextState()).toBe(e_BALL_ACTION.BOUNCE);
		console.log(`[STATE]: ${JSON.stringify(global_state.ft_getMessageResponse().body.ball)}\n`);
	});
	
	it("Player one scores and update it.", () => {
		PARAMS.ball_x_start = 129;
		PARAMS.ball_y_start = 2 * Math.sqrt(3);
		PARAMS.vel_x = 1;
		const	global_state = new GlobalState();
		const	players = [
			new PlayerState(e_TAG_PLAYER.ONE),
			new PlayerState(e_TAG_PLAYER.TWO, 20)
		];
		ft_setPlayers(global_state, players);
		//ft_iterateStates(5, global_state);
		global_state.ft_nextGlobalState();
		const	last_state = global_state.ft_getLastState();
		expect(last_state.body.players[e_TAG_PLAYER.ONE].score).toBe(1);
		console.log(`[STATE]: ${JSON.stringify(last_state)}\n`);
	});

});
