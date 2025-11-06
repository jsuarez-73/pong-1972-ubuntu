import { e_ASCII_ART_FONT, e_Colors, e_DIRECTION, e_LABEL_SIZE, e_PLAYER_STATE, e_TAG_PLAYER, e_TYPE_MESSAGE } from "@cli-types/enums";
import { NodeTree, Tree } from "@segfaultx/container";
import { ComposedLabelFontedElement } from "@shared/element/composed-labelfonted.element";
import { CounterDownLabelFonted } from "@shared/element/counterdown-label.element";
import { ViewElement } from "@shared/element/element";
import { LabelFonted } from "@shared/element/label-fonted.element";
import { CountDownTextFont } from "@shared/textfonts/counterdown.textfont";
import { PongCourtStartTextFont } from "@shared/textfonts/pong-court-start.textfont";
import { ChildViewModel } from "@viewmodel/child-viewmodel";

export	class	PongCourtStart extends ChildViewModel{

	private	tag: e_TAG_PLAYER | undefined;
	private	opponent_state: e_PLAYER_STATE = e_PLAYER_STATE.WAIT;
	private	is_counting: boolean = false;
	private	p_one_wait: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.p_one_wait});
	private	p_two_wait: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.p_two_wait});
	private	p_ready: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.p_ready});
	private	p_one_text: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.p_one_text});
	private	p_two_text: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.p_two_text});
	private	counter_text: LabelFonted = new LabelFonted({texts: CountDownTextFont.labels.counterdown_finish});
	private	counter_label: CounterDownLabelFonted = new CounterDownLabelFonted([e_ASCII_ART_FONT.MINIWI]);
	private	k_up: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.k_up});
	private	k_down: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.k_down});
	private	k_ready: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.k_ready});
	private	text_up: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.text_up});
	private	text_down: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.text_down});
	private	text_ready: LabelFonted = new LabelFonted({texts: PongCourtStartTextFont.labels.text_ready});
	private	lg_player: ComposedLabelFontedElement<LabelFonted> = new ComposedLabelFontedElement();
	private	lg_counter: ComposedLabelFontedElement<LabelFonted> = new ComposedLabelFontedElement();

	constructor (context: Context) {
		super(context);
		this.k_up.ft_setConfig({
			style: {bg: e_Colors.BG_WHITE, fg: e_Colors.FG_BLACK},
			reset: e_Colors.RESET
		});
		this.k_ready.ft_setConfig({
			style: {bg: e_Colors.BG_WHITE, fg: e_Colors.FG_BLACK},
			reset: e_Colors.RESET
		});
		this.k_down.ft_setConfig({
			style: {bg: e_Colors.BG_WHITE, fg: e_Colors.FG_BLACK},
			reset: e_Colors.RESET
		});
		this.lg_player.ft_appendElement(
			this.k_up,
			this.k_down,
			this.k_ready,
			this.text_up,
			this.text_ready,
			this.text_down,
		);
		this.lg_counter.ft_appendElement(
			this.counter_label,
			this.counter_text
		);
	}

	private	ft_selectFont(): void {
		const	space = {
			x: (this.ctx.sc_size_game.x / 2) - 2,
			y: this.ctx.sc_size_game.y - 2
		};
		let	labels_mixed: LabelFontedMixed[] = [
			this.p_ready,
			this.counter_text,
			this.lg_player
		];
		switch (this.tag) {
			case e_TAG_PLAYER.ONE:
				labels_mixed.push(this.p_one_wait);
				break ;
			case e_TAG_PLAYER.TWO:
				labels_mixed.push(this.p_two_wait);
				break ;
		}
		const	font = LabelFonted.ft_selectFont(space, labels_mixed);
		this.ft_setLabelsFont(font);
	}

	private	ft_setLabelsFont(font: e_LABEL_SIZE): void {
		this.lg_player.ft_setFont(font);
		this.lg_counter.ft_setFont(font);
		this.p_ready.ft_setFont(font);
		this.p_one_wait.ft_setFont(font);
		this.p_two_wait.ft_setFont(font);
	}

	private	ft_fixPaddingArrange(): void {
		const	lg_player_size = this.lg_player.ft_getGroupSize();
		const	player_pad_y = (this.ctx.sc_size_game.y / 2 - lg_player_size.y) / 2;
		this.lg_player.ft_modifyArrange(
			{element: this.p_one_text, start: {
				x: this.ctx.start_game.x + this.ctx.sc_size_game.x / 4 - this.p_one_text.ft_getSize().x / 2,
				y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 4
			}},
			{element: this.p_two_text, start: {
				x: this.ctx.start_game.x + 1 + 3 * this.ctx.sc_size_game.x / 4 - this.p_two_text.ft_getSize().x / 2,
				y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 4
			}},
			{element: this.k_up, relative: {padding: player_pad_y}},
			{element: this.k_ready, relative: {padding: player_pad_y}},
			{element: this.k_down, relative: {padding: player_pad_y}}
		);
	}

	private	ft_setPlayerLabelGroup(): void {
		let	arrange_tree: Tree<ArrangeConfig>;
		let	node_root: NodeTree<ArrangeConfig>;
		switch (this.tag) {
			case e_TAG_PLAYER.TWO:
				this.lg_player.ft_appendElement(this.p_two_text);
				node_root = new NodeTree<ArrangeConfig>({
					value: {element: this.p_two_text}
				});
				break ;
			default:
				this.lg_player.ft_appendElement(this.p_one_text);
				node_root = new NodeTree<ArrangeConfig>({
					value: {element: this.p_one_text}
				});
		}
		arrange_tree = new Tree(node_root.ft_attachChildren(new NodeTree<ArrangeConfig>({
			value: {element: this.k_up, relative: {direction: e_DIRECTION.BLOCK_DOWN, padding: 1}},
			children: [
				new NodeTree({
					value: {element: this.text_up, relative: {direction: e_DIRECTION.FLEX_RIGHT, padding: 2}}
				}),
				new NodeTree({
					value: {element: this.k_ready, relative: {direction: e_DIRECTION.BLOCK_DOWN, padding: 1}},
					children: [
						new NodeTree({
							value: {element: this.text_ready, relative: {direction: e_DIRECTION.FLEX_RIGHT, padding: 2}}
						}),
						new NodeTree<ArrangeConfig>({
							value: {element: this.k_down, relative: {direction: e_DIRECTION.BLOCK_DOWN, padding: 1}}
						}).ft_attachChildren(new NodeTree<ArrangeConfig>({
							value: {element: this.text_down, relative: {direction: e_DIRECTION.FLEX_RIGHT, padding: 2}}
						}))
					]
				}),
			]
		})));
		this.lg_player.ft_setArrangeConfig(arrange_tree);
	}

	private	ft_setStartWaitLabel(): void {
		const	size_game_quarter_x = this.ctx.sc_size_game.x / 4;
		const	size_game_quarter_y = this.ctx.sc_size_game.y / 4;
		this.p_one_wait.ft_setStart({
				x: this.ctx.start_game.x + size_game_quarter_x - this.p_one_wait.ft_getSize().x / 2,
				y: this.ctx.start_game.y + 2 * size_game_quarter_y - this.p_one_wait.ft_getSize().y / 2 
		});
		this.p_two_wait.ft_setStart({
				x: this.ctx.start_game.x + 1 + 3 * size_game_quarter_x - this.p_two_wait.ft_getSize().x / 2,
				y: this.ctx.start_game.y + 2 * size_game_quarter_y - this.p_two_wait.ft_getSize().y / 2
		});
	}

	private	ft_setStartReadyLabel(): void {
		const	ready_size = this.p_ready.ft_getSize();
		const	size_game_quarter_x = this.ctx.sc_size_game.x / 4;
		const	size_game_quarter_y = this.ctx.sc_size_game.y / 4;
		switch (this.tag) {
			case e_TAG_PLAYER.TWO:
				this.p_ready.ft_setStart({
					x: this.ctx.start_game.x + size_game_quarter_x - (ready_size.x / 2),
					y: this.ctx.start_game.y + 2 * size_game_quarter_y - (ready_size.y / 2)
				});
				break ;
			case e_TAG_PLAYER.ONE:
				this.p_ready.ft_setStart({
					x: this.ctx.start_game.x + 1 + 3 * size_game_quarter_x - (ready_size.x / 2),
					y: this.ctx.start_game.y + 1 + 2 * size_game_quarter_y - (ready_size.y / 2)
				});
		}
	}

	private	ft_setStartLabels(): void {
		this.ft_setStartWaitLabel();
		this.ft_setStartReadyLabel();
		this.lg_counter.ft_setArrangeConfig(new Tree(new NodeTree<ArrangeConfig>({
			value: {element: this.counter_text, start: {
				x: this.ctx.start_game.x + (this.ctx.sc_size_game.x - this.counter_text.ft_getSize().x) / 2,
				y: this.ctx.start_game.y + this.ctx.sc_size_game.y - this.counter_text.ft_getSize().y - 1
			}},
			children: [new NodeTree<ArrangeConfig>({
				value: {element: this.counter_label, relative: {direction: e_DIRECTION.FLEX_RIGHT, padding: 2}}
			})]
		})));
		this.lg_counter.ft_arrangeElements();
		this.ft_fixPaddingArrange();
	}

	public	ft_getElements(): ViewElement[]{
		const	opponent_label = (this.opponent_state === e_PLAYER_STATE.READY) ? this.p_ready : (this.tag === e_TAG_PLAYER.ONE) ?
			this.p_two_wait : this.p_one_wait;
		let		elements = [
			opponent_label,
			...this.lg_player.ft_getElements(),
		];
		return (this.is_counting ? [...elements, ...this.lg_counter.ft_getElements()] : elements);
	}

	private	ft_setLabels(): void {
		this.ft_setPlayerLabelGroup();
		this.ft_selectFont();
		this.ft_setStartLabels();
	}

	private	ft_updateLabels(msg: NotificationMsg): void {
		this.opponent_state = (this.tag === e_TAG_PLAYER.ONE) ? msg.body.payload.p2 : msg.body.payload.p1;
		this.is_counting = msg.body.payload.countdown_finish;
		if (msg.body.payload.countdown_finish && msg.body.payload.counter !== undefined) {
			this.counter_label.ft_setCounter(msg.body.payload.counter);
		}
	}

	public ft_update(msg: NotificationMsg): void {
		if (this.tag === undefined) {
			this.tag = msg.tag;
			this.ft_setLabels();
		}
		this.ft_updateLabels(msg);
	}

	public ft_handleKeys(_char: string, key: Key): void {
		const	msg = {
			type: e_TYPE_MESSAGE.STATUS_REQUEST,
			body: {
				status: e_PLAYER_STATE.READY
			}
		};
		if (key !== undefined && key.name !== undefined) {
			switch (key.name.toLowerCase()) {
				case "r": 
					this.ctx.model.ft_sendMessage(JSON.stringify(msg));
					break ;
			}
		}
	}
}
