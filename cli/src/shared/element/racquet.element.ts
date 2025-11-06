import { Unicode } from "@shared/chars/chars";
import { ViewElement } from "@shared/element/element";

export class	RacquetElement extends ViewElement {

	private	start: Coord = {x: 0, y: 0};
	private	end: Coord = {x: 0, y: 0};
	private	size: Coord | undefined;

	constructor(config?: RacquetConfig) {
		super();
		if (config !== undefined) {
			this.ft_assertCoord(config.start, config.end);
			if (config.start !== undefined)
				this.ft_setStart(config.start);
			if (config.end !== undefined)
				this.ft_setEnd(config.end);
			if (config.size !== undefined) 
				this.size = config.size;
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

	public	ft_renderToBuffer(buf: string[], cols: number): void {
		for (let i = this.start.x; i <= this.end.x; i++) {
			for (let j = this.start.y; j <= this.end.y; j++) {
				buf[j * cols + i] = Unicode.CHARS.full;
			}
		}
	}

	public	ft_setStart(start: Coord): RacquetElement {
		this.ft_assertCoord(start);
		this.start.x = Math.floor(start.x);
		this.start.y = Math.floor(start.y);
		return (this);
	}

	public	ft_setEnd(end: Coord): RacquetElement {
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
