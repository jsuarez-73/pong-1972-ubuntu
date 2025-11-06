import * as Proxy from "@fastify/http-proxy";

export abstract class	ServiceApi {

	protected	Proxy: typeof Proxy = Proxy;

	public abstract	ft_buildService(fastify: Fastify): void;
}
