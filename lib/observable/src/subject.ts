import { Observer } from "@core/observer"

export class	Subject<T> {

	private	observers = new Set<Observer<T>>();

	constructor () {
	}

	public	ft_subscribe(observer: Observer<T>) : void {
		this.observers.add(observer);
		const subscription = {unsubscribe: () => this.ft_unsubscribe(observer)};
		observer.ft_setSubscription(subscription);
	}

	private	ft_unsubscribe(observer: Observer<T>) : void {
		this.observers.delete(observer);
	}

	public	ft_notify(msg: T) : void {
		this.observers.forEach((obs: Observer<T>) => {
			obs.ft_update(msg);
		});
	}

	public	ft_notifyError(err: any) : void {
		this.observers.forEach((obs: Observer<T>) => {
			obs.ft_error(err);
		});
	}

	public	ft_notifyCompletness() : void {
		this.observers.forEach((obs: Observer<T>) => {
			obs.ft_complete();
		});
	}

	public	ft_getObservers(): Set<Observer<T>> {
		return (this.observers);
	}
}
