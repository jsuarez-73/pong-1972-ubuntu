import { e_Colors } from "@cli-types/enums";
import { ViewElement } from "@shared/element/element";

export class	LabelElement extends ViewElement {

	private	start: Coord = {x: 0, y: 0};
	private	texts: string[] = [];

	constructor (config?: ConfigLabelElement, ...texts: string[]) {
		super();
		if (config)
			this.ft_setConfig(config);
		if (texts)
			this.texts = texts;
	}

	public	ft_setStyle(style: Partial<StyleColors>): LabelElement {
		this.style.bg = style.bg ?? this.style.bg;
		this.style.fg = style.fg ?? this.style.fg;
		return (this);
	}

	public	ft_setStart(start: Coord): LabelElement {
		this.ft_assertCoord(start);
		this.start.x = Math.floor(start.x);
		this.start.y = Math.floor(start.y);
		return (this);
	}

	public	ft_getStart(): Coord {
		return (this.start);
	}

	public	ft_setReset(reset: e_Colors): LabelElement {
		this.reset_color = reset;
		return (this);
	}

	public	ft_setConfig(config: Partial<ConfigLabelElement>): LabelElement {
		if (config.start)
			this.ft_setStart(config.start);
		if (config.style)
			this.ft_setStyle(config.style);
		if (config.reset)
			this.ft_setReset(config.reset);
		return (this);
	}

	public	ft_setTexts(texts: string[]): LabelElement {
		/*[!PENDING]: Assert texts?*/
		this.texts = texts;
		return (this);
	}

	public	ft_getEnd(): Coord {
		let	size: Coord = this.ft_getSize();
		return ({
			x: this.start.x + size.x,
			y: this.start.y + size.y
		});
	}

	public	ft_getSize(): Coord {
		let	size_x = 0;
		this.texts.forEach((row: string) => {
			if (row.length > size_x)
				size_x = row.length;
		});
		return ({x: size_x, y: this.texts.length});
	}

	public	ft_getLabelText(): string[] {
		return (this.texts);
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
		let	start_y = this.start.y;
	    this.texts.forEach((text: string) => {
			let	sub_text = text.slice(0, this.sc_size.x - this.start.x - 1);
			let	start_idx = start_y++ * cols + this.start.x;
			let	start_text = 0;
			let	end_x = this.start.x + sub_text.length;
			for (let start_x = this.start.x; start_x < end_x ; start_x++) {
				buf[start_idx++] = this.ft_setColors(sub_text, start_text++);
			}
		});
	}
}
