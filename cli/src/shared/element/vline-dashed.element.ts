import { VerticalLineElement } from "@shared/element/vertical-line.element";

export class	VLineDashed extends VerticalLineElement {

	constructor(config?: VerticalConfig) {
		super(config);
	}

	public ft_renderToBuffer(buf: string[], cols: number): void {
		for (let start_y = this.start.y; start_y <= this.end.y; start_y += 2) {
			buf[start_y * cols + this.start.x] = this.char;
		}
	}

}
