import { default as readline } from "readline";

export class	KeyboardService {
	private static	instance : KeyboardService | undefined;
	private			map_listener: Map<Listener, Listener> = new Map();

	constructor() {
		if (KeyboardService.instance)
			return (KeyboardService.instance);
		KeyboardService.instance = this;
		readline.emitKeypressEvents(process.stdin);
		if (process.stdin.isTTY)
			process.stdin.setRawMode(true);
	}

	private	ft_registerListener(listener: Listener, decorator: Listener) : void {
		this.map_listener.set(listener, decorator);
		process.stdin.on("keypress", decorator);
	}

	public	ft_removeListener(listener: Listener): KeyboardService {
		const	ref = this.map_listener.get(listener);
		if (ref) {
			process.stdin.removeListener("keypress", ref);
			this.map_listener.delete(listener);
		}
		return (this);
	}

	public	ft_subscribeToControlKeys(listener: Listener): KeyboardService {
		let	decorator: Listener = (_char, key) => {
			if (key.ctrl || key.meta)
				listener(_char, key);
		};
		this.ft_registerListener(listener, decorator);
		return (this);
	}

	public	ft_subscribeToKeys(listener: Listener): KeyboardService {
		let	decorator: Listener = (_char, key) => {
			if (!key.ctrl && !key.meta)
				listener(_char, key);
		};
		this.ft_registerListener(listener, decorator);
		return (this);
	}
}
