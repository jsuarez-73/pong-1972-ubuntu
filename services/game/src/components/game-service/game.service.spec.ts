import { GameService } from "@components/game-service/game.service";
import { e_ACTION, e_GAME_STATE, e_TAG_PLAYER, e_TYPE_MESSAGE } from "@game-types/enums";
import { env } from "node:process";
/*[!IMPORTANT]: We need to test the Workflow of the server so far!*/
const	reporter = {
	specStarted: async function(result: {fullName: string, description: string}) {
		console.log(`\n${result.description}`);
	}
};
jasmine.getEnv().addReporter(reporter);
jasmine.DEFAULT_TIMEOUT_INTERVAL = 2147483647;
const	DEV = Boolean(env.JASMINE_DEV);
const	HOSTNAME = "http://localhost:3000/";
const	GAME_ENDPOINTS = {
	game: HOSTNAME + "v1/game/",
};

/*[!PENDING]: This test is obsolete.*/
class	Player {

	public	tag: e_TAG_PLAYER;
	public	socket: WebSocket;
	public	arrived_msgs: Array<MessageGame> = new Array<MessageGame>;

	constructor (url: string, tag: e_TAG_PLAYER) {
		this.tag = tag;
		this.socket = new WebSocket(url);
		this.socket.addEventListener("message", (msg: MessageEvent) => {
			this.arrived_msgs.push(JSON.parse(msg.data));
		});
	}

	public	ft_isConnected () : Promise<boolean> {
		return (new Promise((res) => {
			setTimeout(() => {
				if (this.socket.readyState === WebSocket.OPEN)
					res(true);
				else
					res(false);
			}, 1000);
		}));
	}

	public	ft_getLastMessage() : Promise<MessageGame | undefined> {
		return (new Promise((resolve) => {
			setTimeout(() => resolve(this.arrived_msgs.shift()), 1000);
		}));
	}

	public	ft_sendMessage(msg: MessageGame) : Player | undefined {
		if (this.socket.readyState === WebSocket.OPEN) {
			console.log(`State Request sent: ${JSON.stringify(msg)}`);
			this.socket.send(JSON.stringify(msg));
			return (this);
		}
	}

	public	ft_closeConnection() : void {
		this.socket.close();
	}

	public	ft_flushMessages(mili: number): Promise<void> {
		return (new Promise((res) => {
				setTimeout(() => {
					while (this.arrived_msgs.length) {
						let	msg = this.arrived_msgs.shift();
						if (msg)
							console.log(`[FLUSHING]: ${JSON.stringify(msg)}`);	
					}
					res();
				}, mili);
			}));
	}
}

describe("[GAME-SERVICE - Connection]", function () {
	let	game_service : GameService;
	let	player_one: Player;
	let	player_two : Player;
	let	state_request = {
		type: e_TYPE_MESSAGE.STATE_REQUEST,
		body: {
			player: "" as any
		}
	};

	beforeAll(async () => {
		if (! DEV) {
			game_service = new GameService();
			/*Waits the next tick to start making the tests.*/
			await new Promise<boolean>((res, _rej) => {
				setTimeout(() => {
					if (game_service.ft_isListen())
						res(true);
					else
						res(false);
				}, 0);
			});
		}
	});
	
	it("Url semantic.", () => {
		expect(() =>{
			player_one = new Player(GAME_ENDPOINTS.game + "1", e_TAG_PLAYER.ONE);	
		}).not.toThrowError();
	});

	if (! DEV) {
		it("Service listening", async () => {
			expect(game_service.ft_isListen()).toBeTrue();
		});
	}

	it("socket connected?", async () => {
		expect(await player_one.ft_isConnected()).toBeTrue();
	});

	it ("malformed message request sent, must receive an error message", async () => {
			if (await player_one.ft_isConnected())
				player_one.ft_sendMessage(state_request);
			await player_one.ft_getLastMessage().then((msg) => {
				expect(msg).not.toBeNull();
				console.log(`The message received is: ${JSON.stringify(msg)}`);
				if (msg)
					expect(msg.type === e_TYPE_MESSAGE.ERROR_RESPONSE).toBeTrue();
			});
	});

	it("well-formed message request sent, must receive an globalState", async () => {
		state_request.body = {
			player: {pos_y: 10, action: e_ACTION.UP}
		};
		if (await player_one.ft_isConnected())
			player_one.ft_sendMessage(state_request);
		await player_one.ft_getLastMessage().then((msg) => {
			expect(msg).not.toBeNull();
			console.log(`in well-formed: The message received is: ${JSON.stringify(msg)}`);
			if (msg)
				expect(msg.type === e_TYPE_MESSAGE.NOTIFICATION).toBeTrue();
		});
	});

	it("Close conncetion", async () => {
		state_request.body = {
			player: {pos_y: 15, action: e_ACTION.DOWN}
		};
		player_two = new Player(GAME_ENDPOINTS.game + "1", e_TAG_PLAYER.TWO);
		if (await player_two.ft_isConnected())
			player_two.ft_sendMessage(state_request);
		await player_two.ft_flushMessages(100);
		player_one.ft_closeConnection();
		await player_two.ft_getLastMessage().then((msg) => {
			console.log(`The closed message received was: ${JSON.stringify(msg)}`);
			expect(msg?.type === e_TYPE_MESSAGE.NOTIFICATION && 
				   msg.body.status === e_GAME_STATE.COUNTDOWN).toBeTrue();
		});
	});

	it("Reconnect a player", async () => {
		await player_two.ft_isConnected();
		await player_two.ft_sendMessage(state_request)?.ft_getLastMessage().then((msg) => {
			console.log(`[PLAYER_TWO]: ${JSON.stringify(msg)}\n`);
			expect(msg?.type === e_TYPE_MESSAGE.NOTIFICATION && 
				   msg.body.status === e_GAME_STATE.COUNTDOWN).toBeTrue();
		}).then(async () => {
			player_one = new Player(GAME_ENDPOINTS.game + "1", e_TAG_PLAYER.ONE);
			await player_one.ft_isConnected();
			await player_two.ft_sendMessage(state_request)?.ft_getLastMessage().then((msg) => {
				console.log(`[PLAYER_TWO]: ${JSON.stringify(msg)}\n`);
				expect(msg?.type === e_TYPE_MESSAGE.NOTIFICATION && 
					   msg?.body.status === e_GAME_STATE.READY).toBeTrue();
			});
			await player_one.ft_getLastMessage().then((msg) => {
				console.log(`[PLAYER_ONE]: ${JSON.stringify(msg)}\n`);
				expect(msg?.type === e_TYPE_MESSAGE.NOTIFICATION && 
					   msg.body.status === e_GAME_STATE.READY).toBeTrue();
			});
			await player_one.ft_getLastMessage().then((msg) => {
				console.log(`[PLAYER_ONE]: ${JSON.stringify(msg)}\n`);
				expect(msg?.type === e_TYPE_MESSAGE.STATE_RESPONSE).toBeTrue();
			});
			await player_two.ft_getLastMessage().then((msg) => {
				console.log(`[PLAYER_TWO]: ${JSON.stringify(msg)}\n`);
				expect(msg?.type === e_TYPE_MESSAGE.STATE_RESPONSE).toBeTrue();
			});
		});
	});
});
