export class Observer<T> {
	
	private	update: (value: T) => void | Promise<void>;
	private	error: ((error: any) => void) | undefined;
	private	complete: (() => void) | undefined;
	private	subscription: Subscription | undefined;

	constructor (update: (value: T) => void | Promise<void>, error?: (err: any) => void, complete?: () => void) {
		this.update = update;
		this.error = error;
		this.complete = complete;
	}

	public	ft_update(value: T): void | Promise<void> {
		return (this.update(value));
	}

	public	ft_error(err: any) : void {
		this.error?.call(this, err);
	}

	public	ft_complete() : void {
		this.complete?.call(this);
	}

	public	ft_setSubscription(subscription: Subscription): Observer<T>{
		this.subscription = subscription;
		return (this);
	}

	public	ft_getSubscription(): Subscription | undefined {
		return (this.subscription);
	}
}
