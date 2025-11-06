import { ViewElement } from "@shared/element/element";
import { TextArea } from "./textarea.element";
import { ListElement } from "./list.element";
import { RowElement } from "./row.element";
import { Observer } from "@segfaultx/observable";

export class	SelectElement extends ViewElement {

	private	text_area: TextArea;
	private	list: ListElement;
	private	focused: ViewElement | undefined;
	private	end: Coord = {x: 0, y: 0};
	private	size: Coord | undefined;
	private	start: Coord = {x: 0, y: 0};
	private	event_ob: Observer<EventElement>

	constructor (config?: SelectConfig) {
		super();
		if (config?.start !== undefined)
			this.start = config?.start;
		if (config?.end !== undefined)
			this.end = config?.end;
		if (config?.size !== undefined)
			this.size = config?.size;
		this.text_area = new TextArea({start: this.start , size: this.ft_getSize()});
		this.list = new ListElement({
			start: {x: this.start.x, y: this.text_area.ft_getEnd().y + 2},
			elements: config?.elements,
			highlight: config?.highlight,
			max_rows: config?.max_rows
		});
		this.event_ob = new Observer((ev: EventElement) => this.ft_handleEvents(ev));
		this.list.ft_listenEvents(this.event_ob);
		this.text_area.ft_listenEvents(this.event_ob);
	}

	public ft_setStart(start: Coord): ViewElement {
		this.ft_assertCoord(start);
		this.start.x = Math.floor(start.x);
		this.start.y = Math.floor(start.y);
		return (this);
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
		if (this.size !== undefined)
			return (this.size);
	    return ({
			x: this.end.x - this.start.x,
			y: this.end.y - this.start.y
		});
	}

	public	ft_setElements(elements: RowElement[]): void {
		this.list.ft_setElements(...elements);
	}

	public	ft_getElements(): RowElement[] {
		return (this.list.ft_getElements());
	}

	public ft_focus(): void {
	    if (this.focused === undefined)
			this.ft_setFocus(this.text_area);
	}

	public ft_disableFocus(): void {
	    this.text_area.ft_disableFocus();
		this.list.ft_disableFocus();
	}

	private	ft_setFocus(element: ViewElement): void {
		this.focused = element;
		this.focused.ft_focus();
	}

	private	ft_getFocus(): ViewElement | undefined {
		return (this.focused);
	}

	private	ft_handleListEvents(ev: EventElement): void {
		if (ev.key.name === "up") {
			if (ev.payload?.before === undefined && ev.payload?.current !== undefined) {
				this.list.ft_disableFocus();
				this.ft_setFocus(this.text_area);
			}
		}
	}

	private	ft_handleEvents(ev: EventElement): void {
		switch (ev.emitter) {
			case this.list:
				this.ft_handleListEvents(ev);
				break ;
			default:
				let	event: EventElement = ev;
				this.event_emitter.ft_notify(event);
		}
	}

	public ft_handleKeys(char: string, key: Key): void {
		switch (key.name) {
			case "down":
				if (this.ft_getFocus() === this.text_area) {
					this.text_area.ft_disableFocus();
					this.ft_setFocus(this.list);
				}
				else if (this.ft_getFocus() === this.list)
					this.list.ft_handleKeys(char, key);
				break ;
			default:
				if (this.ft_getFocus() === this.text_area)
					this.text_area.ft_handleKeys(char, key);
				else if (this.ft_getFocus() === this.list)
					this.list.ft_handleKeys(char, key);
				break ;
		}
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
	    this.text_area.ft_renderToBuffer(buf, cols);
		this.list.ft_renderToBuffer(buf, cols);
	}

}
