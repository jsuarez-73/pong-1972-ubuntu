export interface	GsiClient {
	accounts: {
		id: {
			initialize: Function
		}
	}
}

declare global {
	var google: GsiClient
}
