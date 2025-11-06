import { e_ACTION, e_ASCII_ART_FONT, e_DIRECTION, e_GAME_STATE, e_TYPE_MESSAGE } from "@cli-types/enums";
import { NodeTree, Tree } from "@segfaultx/container";
import { CircleElement } from "@shared/element/circle.element";
import { ComposedLabelFontedElement } from "@shared/element/composed-labelfonted.element";
import { CounterDownLabelFonted } from "@shared/element/counterdown-label.element";
import { ViewElement } from "@shared/element/element";
import { LabelFonted } from "@shared/element/label-fonted.element";
import { RacquetElement } from "@shared/element/racquet.element";
import { CountDownTextFont } from "@shared/textfonts/counterdown.textfont";
import { ChildViewModel } from "@viewmodel/child-viewmodel";

export class	PongCourtGame extends ChildViewModel {

	private	rect_one : RacquetElement = this.ft_initRacquetOne();
	private	rect_two : RacquetElement = this.ft_initRacquetTwo();
	private	circle: CircleElement = this.ft_initCircle();
	private	counter_label_start = new CounterDownLabelFonted([
		e_ASCII_ART_FONT.SHADOW,
		e_ASCII_ART_FONT.MINIWI
	]);
	private	counter_label_finish = new CounterDownLabelFonted([
		e_ASCII_ART_FONT.MINIWI
	]);
	private	counter_text: LabelFonted = new LabelFonted({texts: CountDownTextFont.labels.counterdown_finish});
	private	is_counting_finish: boolean = false;
	private	is_counting_start: boolean = false;
	private	lg_counter: ComposedLabelFontedElement<LabelFonted> = new ComposedLabelFontedElement([
		this.counter_text,
		this.counter_label_finish
	]);

	constructor(context: Context) {
		super(context);
		this.ft_selectFont();
		this.counter_label_start.ft_setStart({
			x: this.ctx.start_game.x + this.ctx.sc_size_game.x / 2 - this.counter_label_start.ft_getSize().x / 2,
			y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 2 - this.counter_label_start.ft_getSize().y / 2
		});
		this.lg_counter.ft_setArrangeConfig(new Tree(new NodeTree<ArrangeConfig>({
			value: {element: this.counter_text, start: {
				x: this.ctx.start_game.x + (this.ctx.sc_size_game.x - this.counter_text.ft_getSize().x) / 2,
				y: this.ctx.start_game.y + this.ctx.sc_size_game.y - this.counter_text.ft_getSize().y - 1
			}},
			children: [new NodeTree<ArrangeConfig>({
				value: {element: this.counter_label_finish, relative: {direction: e_DIRECTION.FLEX_RIGHT, padding: 2}}
			})]
		})));
		this.lg_counter.ft_arrangeElements();
	}

	private	ft_selectFont(): void {
		const	space = {
			x: (this.ctx.sc_size_game.x / 2),
			y: (this.ctx.sc_size_game.y / 2)
		};
		let	labels_mixed: LabelFontedMixed[] = [
			this.counter_label_start
		];
		const	font = LabelFonted.ft_selectFont(space, labels_mixed);
		this.counter_label_start.ft_setFont(font);
		this.lg_counter.ft_setFont(font);
	}

	private	ft_initCircle(): CircleElement {
		return (new CircleElement({
			center: {
				x: this.ctx.start_game.x + this.ctx.sc_size_game.x / 2, 
				y: this.ctx.start_game.y 
			}
		}));
	}

	private	ft_initRacquetOne(): RacquetElement {
		return (new RacquetElement({
			start: {
				x: this.ctx.start_game.x,
				y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 2 - this.ctx.delta_racquet_y
			},
			end: {
				x: this.ctx.start_game.x + this.ctx.delta_racquet_x, 
				y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 2 + this.ctx.delta_racquet_y
			}
		}));
	}

	private	ft_initRacquetTwo(): RacquetElement {
		return (new RacquetElement({
			start: {
				x: this.ctx.end_game.x - this.ctx.delta_racquet_x, 
				y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 2 - this.ctx.delta_racquet_y
			},
			end: {
				x: this.ctx.end_game.x, 
				y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 2 + this.ctx.delta_racquet_y
			}
		}));
	}

	public ft_getElements(): ViewElement[] {
		let elements: ViewElement[] = [
			this.rect_one,
			this.rect_two,
			this.circle,
		];
		if (this.is_counting_start === true)
			elements.push(this.counter_label_start);
		if (this.is_counting_finish === true)
			elements.push(...this.lg_counter.ft_getElements());
		return (elements);
	}

	private	ft_handleNotificationMsg(msg: NotificationMsg) : void {
		this.is_counting_start  = (msg.body.status === e_GAME_STATE.COUNTDOWN &&
			msg.body.payload.counter !== undefined &&
			msg.body.payload.countdown_finish === false);
		if (this.is_counting_start && msg.body.payload.counter !== undefined)
			this.counter_label_start.ft_setCounter(msg.body.payload.counter);
		this.is_counting_finish = msg.body.payload.countdown_finish;
		if (this.is_counting_finish && msg.body.payload.counter !== undefined)
			this.counter_label_finish.ft_setCounter(msg.body.payload.counter);
	}

	private	ft_handleStateResponse(msg: StateResponseMsg) : void {
		const	ball_coord = this.ft_translateCoord({
			x: msg.body.ball.pos_x, 
			y: msg.body.ball.pos_y
		});
		const	one_coord = this.ft_translateCoord({y: msg.body.players[0].pos_y});
		const	two_coord = this.ft_translateCoord({y: msg.body.players[1].pos_y});
		const	scores = [msg.body.players[0].score, msg.body.players[1].score];
		const	start_p1 = {
			x: this.ctx.start_game.x,
			y: one_coord.y - this.ctx.delta_racquet_y
		};
		const	end_p1 = {
			x: this.ctx.start_game.x + this.ctx.delta_racquet_x,
			y: one_coord.y + this.ctx.delta_racquet_y
		};
		const	start_p2 = {
			x: this.ctx.end_game.x - this.ctx.delta_racquet_x,
			y: two_coord.y - this.ctx.delta_racquet_y
		};
		const	end_p2 = {
			x: this.ctx.end_game.x,
			y: two_coord.y + this.ctx.delta_racquet_y
		};
		this.rect_one.ft_setStart(start_p1).ft_setEnd(end_p1);
		this.rect_two.ft_setStart(start_p2).ft_setEnd(end_p2);
		this.circle.ft_setCenter(ball_coord);
		this.ctx.label_score.ft_setScore(scores[0], scores[1]);
	}

	private	ft_translateCoord(coord: Partial<Coord>): Coord {
		const	yhalf_sc_size = this.ctx.start_game.y + this.ctx.sc_size_game.y / 2;
		const	xhalf_sc_size = this.ctx.start_game.x + this.ctx.sc_size_game.x / 2;
		return ({
			x: (coord.x != undefined) ? coord.x * this.ctx.rate_scperpx_game_x + xhalf_sc_size : 0,
			y: (coord.y != undefined) ? yhalf_sc_size - coord.y * this.ctx.rate_scperpx_game_y : 0
		});
	}

	public ft_update(msg: MessageGame): void {
		if (msg.type === e_TYPE_MESSAGE.STATE_RESPONSE)
			this.ft_handleStateResponse(msg as StateResponseMsg);
		else if (msg.type === e_TYPE_MESSAGE.NOTIFICATION)
			this.ft_handleNotificationMsg(msg as NotificationMsg);
	}

	public ft_handleKeys(_char: string, key: Key): void {
		const	msg = {
			type: e_TYPE_MESSAGE.STATE_REQUEST,
			body: {
				player: {
					action: e_ACTION.IDLE
				}
			}
		};
		if (key !== undefined && key.name !== undefined) {
			switch (key.name.toLowerCase()) {
				case "k": 
					msg.body.player.action = e_ACTION.UP;
					this.ctx.model.ft_sendMessage(JSON.stringify(msg));
					break ;
				case "j":
					msg.body.player.action = e_ACTION.DOWN;
					this.ctx.model.ft_sendMessage(JSON.stringify(msg));
					break ;
			}
		}
	}
}
