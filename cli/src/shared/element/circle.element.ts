import { Unicode } from "@shared/chars/chars";
import { ViewElement } from "@shared/element/element";

export class	CircleElement extends ViewElement {

	private	center: Coord = {x: 0, y: 0};

	constructor(config?: {center?: Coord}) {
		super();
		if (config !== undefined) {
			this.ft_assertCoord(config?.center);
			if (config.center !== undefined)
				this.ft_setCenter(config.center);
		}
	}

	public	ft_setStart(start: Coord): CircleElement {
		this.ft_assertCoord(start);
		this.center = start;
		return (this);
	}

	public	ft_getStart(): Coord {
		return (this.center);
	}

	public ft_getEnd(): Coord {
	    return ({
			x: this.center.x + 1,
			y: this.center.y + 1
		});
	}

	public ft_getSize(): Coord {
		const	end = this.ft_getEnd();
	    return ({
			x: end.x - this.center.x,
			y: end.y - this.center.y
		});
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
		const	ctr_x = Math.floor(this.center.x);
		const	ctr_y = Math.floor(this.center.y);
		buf[ctr_y * cols + ctr_x] = Unicode.CHARS.full;
	}
	
	public	ft_setCenter(center: Coord): CircleElement {
		this.ft_assertCoord(center);
		this.center.x = center.x;
		this.center.y = center.y;
		return (this);
	}
}
