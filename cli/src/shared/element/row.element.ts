import { ViewElement } from "@shared/element/element";
import { RectangleElement } from "./rectangle.element";
import { e_Colors } from "@cli-types/enums";

export class	RowElement extends ViewElement {

	private	start: Coord = {x: 0, y: 0};
	private	end: Coord = {x: 0, y: 0};
	private	elements: ViewElement[] = [];
	private	pad: number = 1;
	private	highlight: e_Colors = e_Colors.FG_CYAN;
	private	is_focused: boolean = false;

	constructor (config?: RowConfig) {
		super();
		if (config !== undefined) {
			if (config.start !== undefined)
				this.start = config.start;
			if (config.elements !== undefined && config.elements.length > 0) 
				config.elements.forEach((element: ViewElement) => this.elements.push(element));
			if (config.pad !== undefined)
				this.pad = config.pad;
		}
	}

	public ft_getSize(): Coord {
		const	end = this.ft_getEnd();
		return ({
			x: end.x - this.start.x,
			y: end.y - this.start.y
		});
	}

	public	ft_setElements(...elements: RowElement[]): RowElement {
		if (elements !== undefined && elements.length > 0)
			this.elements = elements;
		return (this);
	}

	public ft_getEnd(): Coord {
		let	acum = {x: - this.pad, y: 0};
		this.elements.forEach((element: ViewElement) => {
			const	size = element.ft_getSize();
			acum.x += size.x + this.pad;
			if (acum.y < size.y)
				acum.y = size.y;
		});
		this.end.x = this.start.x + acum.x;
		this.end.y = this.start.y + acum.y;
		return (this.end);
	}

	public ft_handleKeys(char: string, key: Key): void {
		this.elements.forEach((element: ViewElement) => {
			element.ft_handleKeys(char, key);
		});
	}

	public ft_getStart(): Coord {
	    return (this.start);
	}

	public ft_setStart(start: Coord): RowElement {
	    this.ft_assertCoord(start);
		this.start.x = Math.floor(start.x);
		this.start.y = Math.floor(start.y);
		return (this);
	}

	public ft_disableFocus(): void {
		this.is_focused = false;
	    this.elements.forEach((element: ViewElement) => element.ft_disableFocus());
	}

	public ft_focus(): void {
		this.is_focused = true;    
	}

	public	ft_setHighlight(highlight: e_Colors): RowElement {
		this.highlight = highlight;
		return (this);
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
		let	last_end: Coord;
		const	colors = (this.is_focused) ? {hl: this.highlight, vl: this.highlight} :
			{hl: e_Colors.FG_WHITE, vl: e_Colors.FG_WHITE};
		const	rect = new RectangleElement({
			start: {x: this.start.x, y: this.start.y - 1},
			end: {x: this.ft_getEnd().x + 1, y: this.ft_getEnd().y},
			colors: colors
		});
		rect.ft_renderToBuffer(buf, cols);
		this.elements.forEach((element: ViewElement, index: number, elements: ViewElement[]) => {
			if (index !== 0) {
				last_end = elements[index - 1].ft_getEnd();
				element.ft_setStart({x: last_end.x + this.pad, y: this.start.y});
			}
			else
				element.ft_setStart({x: this.start.x + 1, y: this.start.y});
			element.ft_renderToBuffer(buf, cols);
		});
	}
}
