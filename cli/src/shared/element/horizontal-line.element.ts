import { e_Colors } from "@cli-types/enums";
import { Unicode } from "@shared/chars/chars";
import { ViewElement } from "@shared/element/element";

export	class	HorizontalLineElement extends ViewElement {
	
	private	start: Coord = {x: 0, y: 0};
	private end: Coord = {x: 0, y: 0};;
	private	char: string = Unicode.CHARS.hline;
	private	size: Coord | undefined;
	private	color: e_Colors | undefined;

	constructor(config?: HorizontalConfig) {
		super();
		if (config !== undefined) {
			this.ft_assertCoord(config?.start, config?.end);
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
			if (config.char !== undefined)
				this.char = config.char ?? this.char;
			if (config.color !== undefined)
				this.color = config.color;
		}
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
			x: this.end.x - this.start.x,
			y: this.end.y - this.start.y
		});
	}

	public ft_getStart(): Coord {
	    return (this.start);
	}

	public	ft_setColor(color: e_Colors): HorizontalLineElement {
		this.color = color;
		return (this);
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
		for (let start_x = this.start.x; start_x <= this.end.x; start_x++) {
			if (this.color !== undefined && start_x === this.start.x)
				buf[this.start.y * cols + start_x] = this.color + this.char;
			else if (this.color !== undefined && start_x === this.end.x)
				buf[this.start.y * cols + start_x] = this.char + e_Colors.RESET;
			else
				buf[this.start.y * cols + start_x] = this.char;
		}
	}

	public	ft_setStart(start: Coord): HorizontalLineElement {
		this.ft_assertCoord(start);
		this.start.x = Math.floor(start.x);
		this.start.y = Math.floor(start.y);
		return (this);
	}

	public	ft_setEnd(end: Coord): HorizontalLineElement {
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
