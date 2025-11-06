import { e_Colors } from "@cli-types/enums";
import { ViewElement } from "@shared/element/element";
import { RowElement } from "@shared/element/row.element";
import { Observer } from "@segfaultx/observable";

export class	ListElement extends ViewElement {

	private	highlight: e_Colors = e_Colors.FG_CYAN;
	private	start: Coord = {x: 0, y: 0};
	private	elements: RowElement[] = [];
	private	max_rows: number = 5;
	private	pad: number = 1;
	private	focused: number | undefined;
	private	listener: Observer<EventElement>;

	constructor (config?: ListConfig) {
		super();
		this.listener = new Observer((ev: EventElement) => {
			this.event_emitter.ft_notify(ev);
		});
		if (config !== undefined) {
			if (config.start !== undefined)
				this.start = config.start;
			if (config.elements !== undefined && config.elements.length > 0)
				config.elements.forEach((element: RowElement) => {
					element.ft_listenEvents(this.listener);
					this.elements.push(element);
				});
			if (config.highlight !== undefined) {
				this.highlight = config.highlight;
				this.elements.forEach((row: RowElement) => row.ft_setHighlight(this.highlight));
			}
			if (config.max_rows !== undefined) {
				this.max_rows = config.max_rows > 1 ? config.max_rows : this.max_rows;
			}
		}
	}

	public	ft_setHighlight(color: e_Colors): ListElement {
		this.highlight = color;
		this.elements.forEach((row: RowElement) => row.ft_setHighlight(color));
		return (this);
	}

	public ft_getEnd(): Coord {
		const	size = this.ft_getSize();
		return ({
			x: this.start.x + size.x,
			y: this.start.y + size.y
		});
	}

	public ft_setStart(start: Coord): ListElement {
	    this.ft_assertCoord(start);
		this.start.x = Math.floor(start.x);
		this.start.y = Math.floor(start.y);
		return (this);
	}

	public ft_getSize(): Coord {
		const	size = {x: 0, y: 0};
		this.elements.forEach((element: RowElement) => {
			const	el_size = element.ft_getSize();
			if (el_size.x > size.x)
				size.x = el_size.x;
			size.y += el_size.y + this.pad;
		});
		return (size);
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
	    for (let index = 0; index < this.elements.length; index++) {
			let		start: Coord;
			const	row = this.elements[index];
			if (index === this.max_rows)
				break ;
			if (index === 0)
				start = this.start;
			else {
				start = {
					x: this.elements[index - 1].ft_getStart().x, 
					y: this.elements[index - 1].ft_getEnd().y + this.pad + 1 
				};
			}
			row.ft_setStart(start);
			(this.focused === index) ? row.ft_focus() : row.ft_disableFocus();
			row.ft_renderToBuffer(buf, cols);
		}
	}

	public	ft_setElements(...elements: RowElement[]): ListElement {
		if (elements !== undefined && elements.length > 0)
			this.elements = elements;
		return (this);
	}

	public	ft_getElements(): RowElement[] {
		return (this.elements);
	}

	public ft_getStart(): Coord {
	    return (this.start);
	}

	public ft_focus(): void {
			if (this.focused === undefined && this.elements.length > 0)
				this.focused = 0;
	}

	private	ft_setFocusDown(char: string, key: Key): void {
		if (this.focused === undefined)
			return ;
		let	payload;
		if (this.elements.length > 0 && (this.focused + 1) < this.max_rows) {
			this.focused++;
			payload = {current: this.elements[this.focused], before: this.elements[this.focused - 1]};
		}
		else if (this.elements.length === (this.focused + 1))
			payload = {current: undefined , before: this.elements[this.focused]};
		else if (this.elements.length === 0)
			payload = {current: undefined, before: undefined};
		this.event_emitter.ft_notify({
			emitter: this,
			char: char,
			key: key,
			payload: {
				...payload,
				selected: undefined
			}
		});
	}

	private	ft_setFocusUp(char: string, key: Key): void {
		if (this.focused === undefined)
			return ;
		let	payload;
		if (this.focused > 0 && this.elements.length > 0) {
			this.focused--;
			payload = {current: this.elements[this.focused], before: this.elements[this.focused + 1]};
		}
		else if (this.focused === 0)
			payload = {current: this.elements[this.focused], before: undefined};
		else if (this.elements.length === 0)
			payload = {current: undefined, before: undefined};
		this.event_emitter.ft_notify({
			emitter: this,
			char: char,
			key: key,
			payload: {
				...payload,
				selected: undefined
			}
		});
	}

	public	ft_disableFocus(): void {
		this.focused = undefined;
	}

	private	ft_handleSelected(char: string, key: Key): void {
		if (this.focused !== undefined) {
			this.event_emitter.ft_notify({
				emitter: this,
				char: char,
				key: key,
				payload: {
					selected: this.elements[this.focused],
					current: undefined,
					before: undefined
				}
			});
			this.elements[this.focused].ft_handleKeys(char, key);
		}
	}

	public	ft_getFocused(): RowElement | undefined {
		if (this.focused !== undefined)
			return (this.elements[this.focused]);
		return (undefined);
	}

	public ft_handleKeys(char: string, key: Key): void {
	    switch (key.name) {
			case "up":
				this.ft_setFocusUp(char, key);
				break ;
			case "down":
				this.ft_setFocusDown(char, key);
				break ;
			case "return":
				this.ft_handleSelected(char, key);
				break ;
			default:
				if (this.focused !== undefined) {
					this.elements[this.focused].ft_handleKeys(char, key);
				}
		}
	}
}
