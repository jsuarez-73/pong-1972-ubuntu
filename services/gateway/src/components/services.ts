import { ServiceApi } from "@core/api/service-api";

export class	PluginRegister {

	private	services: ServiceApi[] = [];

	public	ft_setServiceApi(...services: ServiceApi[]): void {
		this.services.push(...services);
	}

	public	ft_registerPlugins(fastify: Fastify): void {
		this.services.forEach((service) => service.ft_buildService(fastify));
	}
}
