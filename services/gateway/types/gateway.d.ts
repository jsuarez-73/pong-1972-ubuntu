/*[!PENDING]: The type must be updated to hold the fields used by fastify.*/
type	HTTPRequest = any;
type	ConfigGatewayServer = {port: number, host?: string, [key: string]: boolean | number | string};
type	Routes = { method: string, url: string, handler?: Function, [key: string]: unknown};
type	Fastify = any;
type	FastifyConfig = {
	logger?: boolean,
	http?: any,
	https?: {
		key: string | Buffer<ArrayBufferLike> | (string | Buffer<ArrayBufferLike>)[] | undefined,
		cert: string | Buffer<ArrayBufferLike> | (string | Buffer<ArrayBufferLike>)[] | undefined
	},
	port: number,
	host?: string
};
/*[!PENDING]: Must be changed by an Object instead of just a type, to make sure a proper creation of it.*/
type	ConfigRequest = {
	headers?: {[index: string]: any},
	data?: {[index: string]: any},
};
type	IncomingMsg = {
	http: http.IncomingMessage,
	data: (Buffer | string | any)[]
};
