import	* as HttpModule from "node:http";
export * from "./types/http-type";
import { ConfigRequest, IncomingMsg } from "./types/http-type";

export class	Http {

	private	https: typeof import("node:https") | undefined;

	constructor () {
		this.ft_initHttp();
	}

	private async	ft_initHttp(): Promise<void> {
		try {
			this.https = await import("node:https");
		}
		catch (error) {
			console.log(`[ERROR]: https is disabled because node \
						was built without crypto module.`);
		}
	}

	public	ft_request(url: URL, config: HttpModule.RequestOptions, data?: string): Promise<IncomingMsg> {
		return (new Promise((res, rej) => {
			let	http_module: typeof this.https | typeof HttpModule;
			if (/^http[:]?$/.test(url.protocol))
				http_module = HttpModule;
			else if (this.https !== undefined && /^https[:]?$/.test(url.protocol))
				http_module = this.https;
			else
				throw new Error("Not protocol allowed");
			const	chunks: (Buffer | string | any)[] = [];
			let req = http_module.request(url.href, config, (response: HttpModule.IncomingMessage) => {
				response.on("data", (chunk) => {
					chunks.push(chunk);
				});
				response.on("end", () => {
					if (response.complete)
						res({http: response, data: chunks});
					else
						rej({message: "Not finished yet."});
				});
			});
			req.on('error', (e: {message: string}) => {
			  console.error(`problem with request: ${e.message}`);
			  rej(e);
			});
			if (data !== undefined)
				req.write(data);
			req.end();
		}));
	}

	public	ft_get(url: string, config?: ConfigRequest): Promise<IncomingMsg> {
		const	_url = new URL(url);
		const	headers = config !== undefined ? config.headers : {};
		const	get_config: HttpModule.RequestOptions = {
			headers: headers,
			method: "GET",
			host: _url.origin,
			path: _url.pathname + _url.search,
		};
		return (this.ft_request(_url, get_config));
	}

	public	ft_post(url: string, config?: ConfigRequest): Promise<IncomingMsg> {
		const	_url = new URL(url);
		const	headers = config !== undefined ? config.headers ?? {} : {};
		let		datafied;
		if (config != undefined) {
			switch (typeof config.data) {
				case "object":
					datafied = JSON.stringify(config.data);
					break ;
				default:
					datafied = config.data;
					break ;
			}
		}
		const	post_config = {
			headers: {
				...headers,
				"Content-Length": datafied !== undefined ? datafied.length : 0 
			},
			method: "POST",
			host: _url.origin,
			path: _url.pathname + _url.search,
		};
		return (this.ft_request(_url, post_config, datafied));
	}
}
