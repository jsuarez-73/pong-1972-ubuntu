import { Router } from "@services/router/router.service";
import { Observer } from "@segfaultx/observable";
import { e_Colors, e_GAME_CONSTANTS, e_GAME_STATE, e_PONG_COURT_VM, e_TYPE_MESSAGE } from "@cli-types/enums";
import { ViewModel } from "@viewmodel/viewmodel";
import { VLineDashed } from "@shared/element/vline-dashed.element";
import { LabelElement } from "@shared/element/label.element";
import { RectangleHoleElement } from "@shared/element/rectangle-hole.element";
import { Unicode } from "@shared/chars/chars";
import { ScoreLabel } from "@shared/element/score-label.element";
import { PongCourtStart } from "./pong-court-start.viewmodel";
import { PongCourtGame } from "./pong-court-game.viewmodel";
import { PongCourtEnd } from "./pong-court-end.viewmodel";
import { ModelPongCourtService } from "@services/model/model-pong-court.service";
import { ViewElement } from "@shared/element/element";

export class	PongCourt extends ViewModel<ModelPongCourtService> {

	/*[!PENDING][!IMPORTANT]: This url must be set up dinamically.*/
	private	url: string = "http://localhost:3000/v1/train/1";//"wss://segfaultx.com/v1/game/207";
	private	sc_size_game = {
		x: this.sc_size.x - (e_PONG_COURT_VM.PADDING_LEFT + e_PONG_COURT_VM.PADDING_RIGHT),
		y: this.sc_size.y - (e_PONG_COURT_VM.PADDING_UP + e_PONG_COURT_VM.PADDING_LOW)
	};
	private	rate_scperpx_game_x: number = this.sc_size_game.x / e_GAME_CONSTANTS.WIDTH;
	private	rate_scperpx_game_y: number = this.sc_size_game.y / e_GAME_CONSTANTS.HEIGHT;
	private	start_game: Coord = {
		x: e_PONG_COURT_VM.PADDING_LEFT,
		y: e_PONG_COURT_VM.PADDING_UP
	};
	private	end_game: Coord = {
		x: this.sc_size.x - 1 - e_PONG_COURT_VM.PADDING_RIGHT,
		y: this.sc_size.y - 1 - e_PONG_COURT_VM.PADDING_LOW
	};
	private	padding: number = e_PONG_COURT_VM.PADDING_LABELS;
	private	delta_racquet_y = Math.floor(e_GAME_CONSTANTS.HALF_RACQUET * this.rate_scperpx_game_y);
	private	delta_racquet_x = Math.floor(e_GAME_CONSTANTS.RACQUET_THICK * this.rate_scperpx_game_x);

	constructor () {
		super(new ModelPongCourtService()); 
		this.view_service.ft_hideCursor();
		super.ft_setParentElements({
			rect_hole: this.ft_initRectangleHole(),
			label_pone: this.ft_initLabelPlayerOne(),
			label_ptwo: this.ft_initLabelPlayerTwo(),
			half_vline: this.ft_initHalfVLine(),
			label_score: this.ft_initLabelScore()
		});
	    super.ft_setContext({
			sc_size_game: this.sc_size_game,
			rate_scperpx_game_x: this.rate_scperpx_game_x,
			rate_scperpx_game_y: this.rate_scperpx_game_y,
			start_game: this.start_game,
			end_game: this.end_game,
			delta_racquet_x: this.delta_racquet_x,
			delta_racquet_y: this.delta_racquet_y,
			label_score: this.elements.label_score,
			model: this.model
		});
		super.ft_setChildren({
			start: PongCourtStart,
			game: PongCourtGame,
			end: PongCourtEnd
		});
		this.model.ft_subscribeToSocket(this.url, new Observer(async (msg: MessageGame) => {
			this.ft_handleMessages(msg);
			await this.ft_render();
		}));
	}

	private	ft_initLabelScore(): ScoreLabel {
		return (new ScoreLabel({
				start: {
					x: this.sc_size_game.x / 2 - 1,
					y: this.end_game.y + 2
				},
				style: {
					bg: e_Colors.BG_WHITE,
					fg: e_Colors.FG_BLACK
				},
				reset: e_Colors.BG_YELLOW
			},
			0,
			0
		));
	}


	private	ft_initHalfVLine(): ViewElement {
		return (new VLineDashed({
			start: {
				x: this.start_game.x + this.sc_size_game.x / 2, 
				y: this.start_game.y,
			},
			end: {
				x: this.start_game.x + this.sc_size_game.x / 2, 
				y: this.end_game.y 
			}
		}));
	}

	private	ft_getPaddingPlayerLabel(username: string, space: number, tag: string) : ConfigPad {
		if (`PLAYER ${tag}: ${username}`.length < space)
			username = `PLAYER ${tag}: ${username}`;
		else if (`PLAYER ${tag}`.length < space)
			username = `PLAYER ${tag}`;
		else
			username = `P${tag}`;
		let	pad = (space - username.length) / 2;
		pad	= pad < 0 ? 0 : pad;
		return ({name: username, pads: [Math.floor(pad), Math.round(pad)]});
	}

	private	ft_buildLabelPlayerOneText() : string[] {
		let		text = " ".repeat(this.padding);
		text += Unicode.CHARS.full;
		const	user_whole_space = this.sc_size_game.x / 2 - this.padding - text.length;
		let		username = "username veryyyyyyyy loooooooooooooooooooong";
		const	config = this.ft_getPaddingPlayerLabel(username, user_whole_space, "1");
		text += " ".repeat(config.pads[0]);
		text += config.name;
		text += " ".repeat(config.pads[1]);
		const	upper_down = " ".repeat(text.length);
		return ([upper_down, text, upper_down]);
	}

	private	ft_initLabelPlayerOne(): ViewElement {
		return (new LabelElement({
				start: {
					x: this.start_game.x,
					y: this.end_game.y + 2
				},
				style: {
					bg: e_Colors.BG_WHITE,
					fg: e_Colors.FG_BLACK
				},
				reset: e_Colors.BG_YELLOW
			},
			...this.ft_buildLabelPlayerOneText(),
		));
	}

	private	ft_buildLabelPlayerTwoText(): string[] {
		/*[!PENDING]: The userames must be set dinamically.*/
		let		username = "username veryyyy loooooooooong";
		const	user_whole_space = this.sc_size_game.x / 2 - 2 * (this.padding + 1);
		const	config = this.ft_getPaddingPlayerLabel(username, user_whole_space, "2");
		let		text = " ".repeat(config.pads[0]);
		text += config.name;
		text += " ".repeat(config.pads[1]);
		text += Unicode.CHARS.full;
		text += " ".repeat(this.padding);
		const	upper_down = " ".repeat(text.length);
		return ([upper_down, text, upper_down]);
	}

	private	ft_initLabelPlayerTwo(): ViewElement {
		return (new LabelElement({
				start: {
					x: this.start_game.x + this.sc_size_game.x / 2 + this.padding + 1,
					y: this.end_game.y + 2
				},
				style: {
					bg: e_Colors.BG_WHITE,
					fg: e_Colors.FG_BLACK
				},
				reset: e_Colors.BG_YELLOW
			},
			...this.ft_buildLabelPlayerTwoText(),
		));
	}
	
	private	ft_initRectangleHole(): ViewElement {
		return (new RectangleHoleElement({
			color: e_Colors.BG_YELLOW,
			outbound: [{x: 0, y: 0}, {x: this.sc_size.x - 1, y: this.sc_size.y - 1}],
			inbound: [
				{
					x: this.start_game.x - 1,
					y: this.start_game.y - 1
				},
				{
					x: this.end_game.x + 1,
					y: this.end_game.y + 1
				}
			]
		}));
	}

	private	ft_setNotificationViews(msg: NotificationMsg) {
		const	status = msg.body.status;
		if (status === e_GAME_STATE.READY || status === e_GAME_STATE.COUNTDOWN) {
			this.ft_popChildViewModel("start");
			this.ft_pushChildViewModel("game");
			this.children.game.ft_update(msg);
		}
		else if (status === e_GAME_STATE.START) {
			if (msg.body.payload.countdown_finish === false)
				this.ft_pushChildViewModel("start");
			this.children.start.ft_update(msg);
		}
		else if (status === e_GAME_STATE.FINISH) {
			this.ft_popAllChildren();
			this.ft_pushChildViewModel("end");
			this.children.end.ft_update(msg);
		}
	}

	private	ft_handleMessages(msg: MessageGame): void {
		if (msg) {
			switch (msg.type) {
				case e_TYPE_MESSAGE.STATE_RESPONSE:
					this.children.game.ft_update(msg as StateResponseMsg);
					break ;
				case e_TYPE_MESSAGE.NOTIFICATION:
					this.ft_setNotificationViews(msg as NotificationMsg);
			}
		}
	}

	protected ft_handleKeys(char: string, key: Key): void {
		if (key.name !== undefined)
			this.ft_getChildrenOnView().forEach((child) => {
				child.ft_handleKeys(char, key);
			});
	}
}
