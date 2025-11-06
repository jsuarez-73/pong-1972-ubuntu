import { RectangleElement } from "@shared/element/rectangle.element";

export class	TextArea extends RectangleElement {

	protected	text_box: string = "";
	protected	cursor: number = 0;
	private		is_focused: boolean = false;

	constructor(config?: RectangleConfig) {
		super(config);
		if (config?.start !== undefined) {
			this.cursor_screen.x = config.start.x + 1;
			this.cursor_screen.y = config.start.y + 1;
		}
	}

	public	ft_getText(): string {
		return (this.text_box);
	}

	public ft_setStart(start: Coord): TextArea {
	    super.ft_setStart(start);
		this.cursor_screen.x = start.x + 1;
		this.cursor_screen.y = start.y + 1;
		return (this);
	}

	public	ft_write(char: string): void {
		const	before_cursor = this.text_box.substring(0, this.cursor);
		const	after_cursor = this.text_box.substring(this.cursor);
		this.text_box = before_cursor + char + after_cursor;
		this.ft_moveForwardCursor();
	}

	public	ft_erase(): void {
		if (this.text_box.length > 0 && this.cursor > 0) {
			const	before_cursor = this.text_box.substring(0, this.cursor - 1);
			const	after_cursor = this.text_box.substring(this.cursor);
			this.text_box = before_cursor + after_cursor;
			this.ft_moveBackwardCursor();
		}
	}

	public	ft_moveCursorAfterRender(): void {
		this.view_service.ft_afterRender(() => {
			this.view_service.ft_cursorTo(
				Math.floor(this.cursor_screen.x),
				Math.floor(this.cursor_screen.y)
			);
		});
	}

	public	ft_moveForwardCursor(): void {
		if (this.text_box.length > this.cursor) {
			this.cursor++;
			if (this.cursor_screen.x < (this.end.x - 1)) {
				this.cursor_screen.x++;
				this.ft_moveCursorAfterRender();
			}
		}
	}

	public	ft_moveBackwardCursor(): void {
		if (this.cursor > 0) {
			this.cursor--;
			if ((this.start.x + 1) < this.cursor_screen.x) {
				this.cursor_screen.x--;
				this.ft_moveCursorAfterRender();
			}
		}
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
	    super.ft_renderToBuffer(buf, cols);
		const	left_size = this.cursor_screen.x - this.start.x - 1;
		const	right_size = this.end.x - this.cursor_screen.x;
		const	text_size = this.end.x - 1 - this.start.x;
		let		text: string;
		if (left_size === 0 && this.cursor !== 0) {
			const	end = this.cursor - text_size < 0 ? text_size : this.cursor;
			text = this.text_box.substring(this.cursor - text_size, end);
			const	pad = (end === this.cursor) ? text.length : this.cursor;
			this.cursor_screen.x = this.start.x + 1 + pad;
		}
		else
			text = this.text_box.substring(this.cursor - left_size, this.cursor + right_size);
		for (let index = 0; index < text.length; index++) {
			buf[(this.start.y + 1) * cols + (this.start.x + 1 + index)] = text.charAt(index);
		}
	}

	public	ft_focus(): void {
		this.is_focused = true;
		this.ft_moveCursorAfterRender();
	}

	public ft_disableFocus(): void {
		if (this.is_focused) {
			this.view_service.ft_resetAfterRender();
			this.is_focused = false;
		}
	}

	public	ft_handleKeys(char: string, key: Key): void {
		switch (key.name) {
			case "right":
				this.ft_moveForwardCursor();
				break ;
			case "left":
				this.ft_moveBackwardCursor();
				break ;
			case "backspace":
				this.ft_erase();
				break ;
			default:
				if (/^([a-zA-Z]|[-_@.,]|\d)$/.test(char)) {
					this.ft_write(char);
					this.event_emitter.ft_notify({
						emitter: this,
						char: char,
						key: key,
						payload: {
							text: this.text_box
						}
					});
				}
		}
	}
}
