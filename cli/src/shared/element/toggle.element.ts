import { e_Colors } from "@cli-types/enums";
import { ViewElement } from "@shared/element/element";
import { LabelElement } from "@shared/element/label.element";

export class	ToggleElement extends ViewElement {

	private	highlight: StyleColors = {
		bg: e_Colors.BG_YELLOW,
		fg: e_Colors.FG_BLACK
	};
	private	start: Coord = {x: 0, y: 0};
	private	end: Coord = {x: 0, y: 0};
	private	style_rg: Partial<StyleColors> = {bg: e_Colors.BG_RED, fg: e_Colors.FG_WHITE};
	private	style_lf: Partial<StyleColors> = {bg: e_Colors.BG_GREEN, fg: e_Colors.FG_BLACK};
	private	right_slot: LabelElement = new LabelElement({style: this.style_rg}, "KO");
	private	left_slot: LabelElement = new LabelElement({style: this.style_lf}, "OK");
	private	focused: LabelElement | undefined;
	private	pad: number = 1;

	constructor (config?: ToogleConfig) {
		super();
		if (config?.start !== undefined)
			this.start = config.start;
		this.highlight.bg = config?.highlight?.bg ?? this.highlight.bg;
		this.highlight.fg = config?.highlight?.fg ?? this.highlight.fg;
		this.ft_setSlots(config);
	}

	private	ft_setSlots(config?: ToogleConfig): void {
		if (config?.config_lf !== undefined) {
			this.left_slot.ft_setConfig(config.config_lf);
			this.left_slot.ft_setStart(this.start);
			this.style_lf = config.config_lf.style ?? this.style_lf;
		}
		if (config?.config_rg !== undefined) {
			const	start_rg = this.start.x + Math.floor(this.left_slot.ft_getSize().x + this.pad);
			this.right_slot.ft_setConfig(config.config_rg);
			this.right_slot.ft_setStart({x: start_rg, y: this.start.y});
			this.style_rg = config.config_rg.style ?? this.style_rg;
		}
	}

	public	ft_setStart(start: Coord): ToggleElement {
		this.ft_assertCoord(start);
		const	size = this.ft_getSize();
		this.start.x = Math.floor(start.x);
		this.start.y = Math.floor(start.y);
		this.left_slot.ft_setStart(this.start);
		this.right_slot.ft_setStart({
			x: this.left_slot.ft_getEnd().x + this.pad,
			y: this.start.y
		});
		this.ft_setEnd({x: this.start.x + size.x, y: this.start.y + size.y});
		return (this);
	}

	public	ft_setEnd(end: Coord): ToggleElement {
		this.ft_assertCoord(end);
		this.end.x = Math.floor(end.x);
		this.end.y = Math.floor(end.y);
		return (this);
	}

	public ft_getEnd(): Coord {
	    return (this.end);
	}

	public ft_getStart(): Coord {
	    return (this.start);
	}

	public ft_getSize(): Coord {
		const	rg_size = this.right_slot.ft_getSize();
		const	lf_size = this.left_slot.ft_getSize();
		return ({
			x: lf_size.x + rg_size.x + this.pad,
			y: lf_size.y > rg_size.y ? lf_size.y : rg_size.y
		});
	}

	public ft_focus(): void {
		if (this.focused === undefined)
			this.ft_setFocusLeft();
	}

	private	ft_setFocusRight(): void {
		this.focused = this.right_slot;
		this.right_slot.ft_setStyle({
			bg: this.highlight.bg,
			fg: this.highlight.fg
		});
		if (this.style_lf !== undefined)
			this.left_slot.ft_setStyle(this.style_lf);
	}

	private	ft_setFocusLeft(): void {
		this.focused = this.left_slot;
		this.left_slot.ft_setStyle({
			bg: this.highlight.bg,
			fg: this.highlight.fg
		});
		if (this.style_rg !== undefined)
			this.right_slot.ft_setStyle(this.style_rg);
	}

	public	ft_disableFocus(): void {
		this.focused = undefined;
		if (this.style_lf !== undefined)
			this.left_slot.ft_setStyle(this.style_lf);
		if (this.style_rg !== undefined)
			this.right_slot.ft_setStyle(this.style_rg);
	}

	private	ft_handleSelected(char: string, key: Key): void {
		if (this.focused === this.right_slot)
			this.event_emitter.ft_notify({
				emitter: this,
				char: char,
				key: key,
				payload: {
					is_accepted: false,
				}
			});
		else if (this.focused === this.left_slot)
			this.event_emitter.ft_notify({
				emitter: this,
				char: char,
				key: key,
				payload: {
					is_accepted: true
				}
			});
	}

	public ft_handleKeys(char: string, key: Key): void {
	    switch (key.name) {
			case "right":
				if (this.focused === undefined)
					this.ft_setFocusLeft();
				else
					this.ft_setFocusRight();
				break ;
			case "left":
				if (this.focused === this.left_slot || this.focused === undefined)
					this.ft_disableFocus();
				else
					this.ft_setFocusLeft();
				break ;
			case "return":
				this.ft_handleSelected(char, key);
		}
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
		this.right_slot.ft_renderToBuffer(buf, cols);
		this.left_slot.ft_renderToBuffer(buf, cols);
	}
}
