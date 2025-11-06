import { Observer } from "@segfaultx/observable";

export class	ModelPongCourtService implements ModelPongCourtService {

	private static	instance: ModelPongCourtService | undefined;
	private	socket: WebSocket | undefined;
	private	observer: Observer<MessageGame> | undefined;
	private	last_message: void | Promise<void> = undefined;

	constructor() {
		if (ModelPongCourtService.instance)
			return (ModelPongCourtService.instance);
		ModelPongCourtService.instance = this;
	}

	public	ft_subscribeToSocket(url: string, ob: Observer<MessageGame>) : boolean {
		/*[!PENDING]: How to handle errors from initialization.*/
		/*[!PENDING]: How to handle the other events*/
		this.observer = ob;
		try {
			this.socket = new WebSocket(url);
			this.socket.addEventListener("message", (ev: MessageEvent<any>) => {
				try {
					/*[!PENDING][!IMPORTANT]: What to do if the client can't read
					* messages from a network connection problem? I think the connection
					* is closed by the socket server and that will notify the other client
					* and also the server will stop.*/
					if (this.last_message === undefined) {
						this.last_message = this.observer?.ft_update(JSON.parse(ev.data));
					}
					else {
						if (this.last_message instanceof Promise) {
							this.last_message = this.last_message.then(async () => {
								await this.observer?.ft_update(JSON.parse(ev.data));
								return ;
							});
						}
					}
				}
				catch (err: unknown) {}
			});
		}
		catch (err: unknown) {
			return (false);
		}
		return (true);
	}

	public	ft_unsubscribeFromSocket(): ModelPongCourtService {
		this.observer?.ft_getSubscription()?.unsubscribe();
		return (this);
	}

	public	ft_sendMessage(msg: string): void {
		/*[!PENDING]: How to let the viewmodel knows that couldn't been sent the msg.*/
		if (this.socket?.readyState === WebSocket.OPEN)
			this.socket.send(msg);
	}
}
