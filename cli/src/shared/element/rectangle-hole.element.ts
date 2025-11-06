import { e_Colors } from "@cli-types/enums";
import { ViewElement } from "@shared/element/element";

export class	RectangleHoleElement extends ViewElement {

	private	out_start: Coord = {x: 0, y: 0};
	private	out_end: Coord = {x: 0, y: 0};
	private	in_start: Coord = {x: 0, y: 0};
	private	in_end: Coord = {x: 0, y: 0};
	private	out_size: Coord | undefined;
	private	in_size: Coord | undefined;

	constructor (config?: {color?: e_Colors, outbound?: Coord[], inbound?: Coord[], outbound_size?: Coord, inbound_size?: Coord}) {
		super();
		if (config !== undefined) {
			if (config.outbound !== undefined) {
				config.outbound.forEach((coord) => this.ft_assertCoord(coord));
				[this.out_start, this.out_end] = config.outbound;
			}
			if (config.outbound_size !== undefined) 
				this.out_size = config.outbound_size;
			if (config.inbound !== undefined) {
				config.inbound.forEach((coord) => this.ft_assertCoord(coord));
				[this.in_start, this.in_end] = config.inbound;
			}
			if (config.inbound_size !== undefined) {
				this.in_size = config.inbound_size;
				this.in_end.x = this.in_start.x + this.in_size.x;
				this.in_end.y = this.in_start.y + this.in_size.y;
			}
			if (config.color !== undefined)
				this.style.bg = config.color;
		}
	}

	public ft_getStart(): Coord {
	    return (this.out_start);
	}

	public ft_getSize(): Coord {
	    return ({
			x: this.out_end.x - this.out_start.x,
			y: this.out_end.y - this.out_start.y
		});
	}

	public ft_getEnd(): Coord {
		if (this.out_size !== undefined) {
			return ({
				x: this.out_start.x + this.out_size.x,
				y: this.out_start.y + this.out_size.y
			});
		}
		return (this.out_end);
	}

	public ft_setStart(start: Coord): RectangleHoleElement{
	    this.ft_assertCoord(start);
		this.out_start = start;
		return (this);
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
		for (let row = this.out_start.y; row <= this.out_end.y; row++) {
			for (let col = this.out_start.x; col <= this.out_end.x; col++) {
				if (row > this.in_start.y && row < this.in_end.y) {
					if (col === this.out_start.x || col === this.in_end.x)
						buf[row * cols + col] = this.ft_prependColor(" ", this.style.bg);
					else if (col === this.out_end.x || col === this.in_start.x)
						buf[row * cols + col] = this.ft_appendColor(" ", e_Colors.RESET);
				}
				else {
					if (col === this.out_start.x)
						buf[row * cols + col] = this.ft_prependColor(" ", this.style.bg);
					else if (col === this.out_end.x)
						buf[row * cols + col] = this.ft_appendColor(" ", e_Colors.RESET);
				}
			}
		}
	}
}
