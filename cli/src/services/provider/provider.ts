
/*
	* Singleton class which provide an API to set and get from global Scope,
	* intended to allow communication between viewmodels and childviewmodels.
	* @extends {Map<string, any>}
	* */
export	class	Provider extends Map<string, any> {
	
	private	static	instance?: Provider;

	constructor () {
		super();
		if (Provider.instance == undefined)
			Provider.instance = this;
		return (Provider.instance);
	}

	public static	getInstance(): Provider {
		if (this.instance == undefined) {
			this.instance = new Provider();
		}
		return (this.instance);
	}
}
