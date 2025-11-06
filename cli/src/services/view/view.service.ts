import { ViewElement } from "@shared/element/element";
import { Direction, WriteStream } from "tty";

export class ViewService {

	private static instance: ViewService | undefined;
	private stream: WriteStream = process.stdout;
	protected cursor: Coord = { x: 0, y: 0 };
	public sc_size: Coord = {
		x: this.stream.columns,
		y: this.stream.rows
	};
	public	sc_index: Coord = {
		x: this.stream.columns - 1,
		y: this.stream.rows - 1
	}
	private screen_buff: string[] = new Array(this.stream.columns * this.stream.rows).fill(" ");
	private	after_render: (() => Promise<void> | void) | undefined;

	constructor() {
		if (ViewService.instance)
			return (ViewService.instance);
		ViewService.instance = this;
		this.stream.on("resize", () => {
			this.sc_size.x = this.stream.columns;
			this.sc_size.y = this.stream.rows;
			this.sc_index.x = this.stream.columns - 1;
			this.sc_index.y = this.stream.rows - 1;
		});
	}

	//Hide cursor CSI ? Ps l
	public	ft_hideCursor(): Promise<boolean> {
		return (this.ft_write("\x1b[?25l"));
	}

	//Show cursor CSI ? Ps h
	//CSI === (1b [) (ESC [)
	public ft_showCursor(): Promise<boolean> {
		return (this.ft_write("\x1b[?25h"));
	}

	public	ft_afterRender(cb: (() => Promise<void> | void)): void {
		this.after_render = cb;
	}

	public	ft_resetAfterRender(): void {
		this.after_render = undefined;
	}

	public async ft_renderElements(elements: ViewElement[]): Promise<void> {
		/*[!PENDING]: Assert the key is an ViewElement
		* and got a ft_renderToBuffer method.*/
		elements.forEach((element) => {
			element.ft_renderToBuffer(this.screen_buff, this.stream.columns)
		});
		/*[!TODO]: Set the pongcourt views the property to hide and show the cursor.
		* Implements hooks in this function to allow reset the cursor to default position
		* */
		await this.ft_cursorTo(0, 0);
		await this.ft_write(this.screen_buff.join(""));
		this.screen_buff = this.screen_buff.fill(" ");
		if (this.after_render !== undefined) {
			await this.after_render();
		}
	}

	public ft_cursorTo(x: number, y?: number): Promise<boolean> {
		this.cursor.x = x;
		this.cursor.y = y ?? this.cursor.y;
		return (new Promise((res) => {
			this.stream.cursorTo(x, y, () => {
				res(true);
			});
		}));
	}

	public ft_moveCursor(dx: number, dy: number): Promise<boolean> {
		this.cursor.x += dx;
		this.cursor.y += dy;
		return (new Promise((res) => {
			this.stream.moveCursor(dx, dy, () => {
				res(true);
			});
		}));
	}

	public ft_write(data: string): Promise<boolean> {
		return (new Promise((res) => {
			this.stream.write(data, "utf-8", (err: Error | undefined) => {
				if (err)
					res(false);
				res(true);
			});
		}));
	}

	public ft_clearScreenDown(): Promise<boolean> {
		this.screen_buff = this.screen_buff.fill(" ");
		return (this.ft_write(this.screen_buff.join("")));
	}

	public ft_clearLine(dir: Direction, cb?: () => void): void {
		this.stream.clearLine(dir, cb);
	}

	public ft_getCursor(): Coord {
		return (this.cursor);
	}

	public async ft_cleanScreen(): Promise<boolean> {
		await this.ft_cursorTo(0, 0);
		return (await this.ft_clearScreenDown());
	}
}
