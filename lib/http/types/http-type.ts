import http from "node:http";

export type	IncomingMsg = {
	http: http.IncomingMessage,
	data: (Buffer | string | any)[]
};
export type	ConfigRequest = {
	headers?: {[index: string]: any},
	data?: {[index: string]: any} | string,
};
