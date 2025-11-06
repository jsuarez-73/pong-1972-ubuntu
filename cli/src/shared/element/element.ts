import { e_Colors } from "@cli-types/enums";
import { ViewService } from "@services/view/view.service";
import { Observer, Subject } from "@segfaultx/observable";

/*[!PENDING][!CURIOSITY]: As ViewService is a Singleton
* trying to extends trigger a TypeScript Error, this means
* that a unique instance can't be shared throught different
* objects? Maybe is a bug? Maybe it is my missunderstanding
* from the concept*/
export abstract class ViewElement {

	protected	style: StyleColors = {
		bg: e_Colors.BG_DEFAULT,
		fg: e_Colors.FG_DEFAULT
	};
	protected	sc_size = {
		x: this.view_service.sc_size.x,
		y: this.view_service.sc_size.y
	};
	protected	reset_color = e_Colors.RESET;
	protected	cursor_screen: Coord = {x: 0, y: 0};
	protected	event_emitter: Subject<EventElement> = new Subject();

	constructor(
	protected view_service: ViewService = new ViewService()
	) {}

	protected	ft_assertCoord(...coords: (Coord | undefined)[]): void {
		coords.forEach((coord: Coord | undefined, _index: number) => {
			if (coord === undefined)
				return ;
			if (coord.x < 0 || coord.y < 0 || this.sc_size.x <= coord.x ||
				this.sc_size.y <= coord.y)
				coord.x = Math.abs(coord.x);
				coord.y = Math.abs(coord.y);
		});
	}

	protected	ft_setColors(text: string, index: number): string {
		let		converted: string = text.charAt(index);
		const	is_bg = this.style.bg !== e_Colors.BG_DEFAULT;
		const	is_fg = this.style.fg !== e_Colors.FG_DEFAULT;
		if (index === 0 && is_bg)
			converted = this.style.bg + converted;
		if (index === 0 && is_fg)
			converted = this.style.fg + converted;
		if (index === (text.length - 1) && (is_bg || is_fg))
			converted += this.reset_color;
		return (converted);
	}

	protected	ft_prependColor(char: string, ...colors: e_Colors[]): string {
		let		converted: string = char;
		if (colors.length < 1)
			return (char);
		colors.forEach((color) => converted = color + converted);
		return (converted);
	}

	protected	ft_appendColor(char: string, ...colors: e_Colors[]): string {
		let		converted: string = char;
		if (colors.length < 1)
			return (char);
		colors.forEach((color) => converted += color);
		return (converted);
	}

	public		ft_handleKeys(_char: string, _key: Key): void {}
	public		ft_focus(): void {}
	public		ft_disableFocus(): void {}
	public		ft_listenEvents(ob: Observer<EventElement>): ViewElement {
		this.event_emitter.ft_subscribe(ob);
		return (this);
	}

	public abstract ft_renderToBuffer(buf: string[], cols: number): void;
	public abstract ft_getStart(): Coord;
	public abstract ft_getEnd(): Coord;
	public abstract ft_getSize(): Coord;
	public abstract	ft_setStart(start: Coord): ViewElement;
}
