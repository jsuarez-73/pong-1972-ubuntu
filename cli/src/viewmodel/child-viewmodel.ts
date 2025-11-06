import { ViewElement } from "@shared/element/element";

export abstract class	ChildViewModel {

	protected	ctx: Context;
	constructor(context: Context) {
		this.ctx = context;
	}

	public	abstract	ft_getElements(): ViewElement[];
	public	abstract	ft_update(msg: MessageGame): void;
	public	abstract	ft_handleKeys(_char: string, key: Key): void;
}

