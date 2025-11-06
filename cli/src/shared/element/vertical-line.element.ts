import { e_Colors } from "@cli-types/enums";
import { Unicode } from "@shared/chars/chars";
import { ViewElement } from "@shared/element/element";

export	class	VerticalLineElement extends ViewElement {
	
	protected	start: Coord = {x: 0, y: 0};
	protected	end: Coord = {x: 0, y: 0};;
	protected	char: string = Unicode.CHARS.vline;
	protected	size: Coord | undefined;
	protected	color: e_Colors | undefined;

	constructor(config?: VerticalConfig) {
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
			this.char = config.char ?? this.char;
			if (config.color !== undefined)
				this.color = config.color;
		}
	}

	/*[!PENDING][!IMPORTANT]: If a do a pipe, we got a stream  error![!FIX]*/

	public	ft_renderToBuffer(buf: string[], cols: number): void {
		for (let start_y = this.start.y; start_y <= this.end.y; start_y++) {
			if (this.color !== undefined)
				buf[start_y * cols + this.start.x] = this.color + this.char + e_Colors.RESET;
			else
				buf[start_y * cols + this.start.x] = this.char;
		}
	}

	public	ft_setColor(color: e_Colors): VerticalLineElement {
		this.color = color;
		return (this);
	}

	public	ft_setStart(start: Coord): VerticalLineElement {
		this.ft_assertCoord(start);
		this.start.x = Math.floor(start.x);
		this.start.y = Math.floor(start.y);
		return (this);
	}

	public	ft_setEnd(end: Coord): VerticalLineElement {
		this.ft_assertCoord(end);
		this.end.x = Math.floor(end.x);
		this.end.y = Math.floor(end.y);
		if (this.size !== undefined) {
			this.size.x = this.end.x - this.start.x;
			this.size.y = this.end.y - this.start.y;
		}
		return (this);
	}

	public ft_getEnd(): Coord {
		if (this.size !== undefined) {
			this.end.x = this.start.x + this.size.x;
			this.end.y = this.start.y + this.size.y;
		}
	    return (this.end);
	}

	public ft_getStart(): Coord {
	    return (this.start);
	}

	public ft_getSize(): Coord {
	    return ({
			x: this.end.x - this.start.x,
			y: this.end.y - this.start.y
		});
	}
}
