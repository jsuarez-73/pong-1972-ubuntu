import { e_Colors } from "@cli-types/enums";
import { Unicode } from "@shared/chars/chars";
import { ViewElement } from "@shared/element/element";
import { HorizontalLineElement } from "@shared/element/horizontal-line.element";
import { VerticalLineElement } from "@shared/element/vertical-line.element";

export class	RectangleElement extends ViewElement {
	
	protected	start: Coord = {x: 0, y: 0};
	protected	end: Coord = {x: 0, y: 0};
	protected	has_hlines : boolean = false;
	protected	has_vlines : boolean = false;
	protected	lines: (HorizontalLineElement | VerticalLineElement)[] = [];
	protected	size: Coord | undefined;
	protected	colors: {hl?: e_Colors, vl?: e_Colors} | undefined;

	constructor(config?: RectangleConfig) {
		super();
		if (config !== undefined) {
			this.ft_assertCoord(config.start, config.end);
			if (config.start !== undefined) {
				this.start.x = Math.floor(config.start.x);
				this.start.y = Math.floor(config.start.y);
			}
			if (config.end !== undefined) {
				this.end.x = Math.floor(config.end.x);
				this.end.y = Math.floor(config.end.y);
			}
			if (config.size !== undefined) {
				this.size = config.size;
				this.end.x = this.start.x + this.size.x;
				this.end.y = this.start.y + this.size.y;
			}
		}
		this.lines.push(
			new HorizontalLineElement({start: {x: 0, y:0}, end: {x: 0, y:0}, char: config?.style?.char_x}),
			new HorizontalLineElement({start: {x: 0, y:0}, end: {x: 0, y:0}, char: config?.style?.char_x}),
			new VerticalLineElement({start: {x:0, y:0}, end: {x: 0, y: 0}, char: config?.style?.char_y}),
			new VerticalLineElement({start: {x:0, y:0}, end: {x: 0, y: 0}, char: config?.style?.char_y}),
		);
		this.ft_setColor(config?.colors);
	}

	public	ft_setColor(colors?: {hl?: e_Colors, vl?: e_Colors}): RectangleElement {
		this.colors = colors;
		if (colors !== undefined) {
			this.lines.forEach((line) => {
				if (line instanceof HorizontalLineElement && colors.hl !== undefined)
					line.ft_setColor(colors.hl);
				if (line instanceof VerticalLineElement && colors.vl !== undefined)
					line.ft_setColor(colors.vl);
			});
		}
		return (this);
	}

	private	ft_hasHVLines(): void {
		this.has_hlines = (this.end.x - this.start.x > 1) ? true : false;
		this.has_vlines = (this.end.y - this.start.y > 1) ? true : false;
	}

	public ft_getStart(): Coord {
	    return (this.start);
	}

	public ft_getEnd(): Coord {
		if (this.size !== undefined) {
			this.end.x = this.start.x + this.size.x;
			this.end.y = this.start.y + this.size.y;
		}
	    return (this.end);
	}

	public ft_getSize(): Coord {
	    return ({
			x: this.end.x - this.start.x + 1,
			y: this.end.y - this.start.y + 1
		});
	}

	private	ft_draw_coners(buf: string[], cols: number): void {
		buf[this.start.y * cols + this.start.x] = Unicode.CHARS.rgup_corner;
		buf[this.start.y * cols + this.end.x] = Unicode.CHARS.lfup_corner;
		buf[this.end.y * cols + this.start.x] = Unicode.CHARS.rglo_corner;
		buf[this.end.y * cols + this.end.x] = Unicode.CHARS.lflo_corner;
	}

	private	ft_setHLines() : void {
		const	delta = (this.has_vlines) ? 1 : 0;
		const	up_hs = {x: this.start.x + delta, y: this.start.y};
		const	up_he = {x: this.end.x - delta, y: this.start.y};
		const	down_hs = {x: this.start.x + delta, y: this.end.y};
		const	down_he = {x: this.end.x - delta, y: this.end.y};
		this.lines[0].ft_setStart(up_hs).ft_setEnd(up_he);
		this.lines[1].ft_setStart(down_hs).ft_setEnd(down_he);
	}

	private	ft_setVLines(): void {
		const	delta = (this.has_hlines) ? 1 : 0;
		const	lf_vs = {x: this.start.x, y: this.start.y + delta};
		const	lf_ve = {x: this.start.x, y: this.end.y - delta};
		const	rg_vs = {x: this.end.x, y: this.start.y + delta};
		const	rg_ve = {x: this.end.x, y: this.end.y - delta};
		this.lines[2].ft_setStart(lf_vs).ft_setEnd(lf_ve);
		this.lines[3].ft_setStart(rg_vs).ft_setEnd(rg_ve);
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
		this.ft_hasHVLines();
		if (this.has_hlines)
			this.ft_setHLines();
		if (this.has_vlines)
			this.ft_setVLines();
		this.lines.forEach((line: ViewElement) => line.ft_renderToBuffer(buf, cols));
		if (this.has_hlines && this.has_vlines)
			this.ft_draw_coners(buf, cols);
	}

	public	ft_setStart(start: Coord): RectangleElement {
		this.ft_assertCoord(start);
		this.start.x = Math.floor(start.x);
		this.start.y = Math.floor(start.y);
		if (this.size !== undefined) {
			this.end.x = this.start.x + this.size.x;
			this.end.y = this.start.y + this.size.y;
			return (this);
		}
		this.end.x += this.start.x;
		this.end.y += this.start.y;
		return (this);
	}

	public	ft_setEnd(end: Coord): RectangleElement {
		this.ft_assertCoord(end);
		this.end.x = Math.floor(end.x);
		this.end.y = Math.floor(end.y);
		if (this.size !== undefined) {
			this.size.x = this.end.x - this.start.x;
			this.size.y = this.end.y - this.start.y;
		}
		return (this);
	}

}
