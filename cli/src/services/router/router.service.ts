import { KeyboardService } from "@services/keyboard/keyboard.service";
import { ViewService } from "@services/view/view.service";
import { ViewModel } from "@viewmodel/viewmodel";

export class	Router {

	private static	instance: Router | undefined;
	private			routes: Route[] = [];
	private			current_view: ViewModel<ModelService> | undefined;

	constructor (
		private			keyboard: KeyboardService = new KeyboardService(),
		private			view_service: ViewService = new ViewService()
	) {
		if (Router.instance)
			return (Router.instance);
		Router.instance = this;
		this.keyboard.ft_subscribeToControlKeys((_char, key) => {
			if (key !== undefined && key.name !== undefined) {
				if (key.name.toLowerCase() === "q") {
					this.view_service.ft_showCursor();
					/*[!PENDING]: What's supposed to do when finished?*/
					this.ft_exit();
				}
			}
		});
	}

	public	ft_setRoutes(routes: Route[]): Router {
		if (this.routes.length)
			return (this);
		this.routes = routes;
		return (this);
	}

	public	async ft_navigate(path: string) : Promise<void> {
		if (this.current_view) {
			this.current_view.ft_dispose();
			this.current_view = undefined;
		}
		this.view_service.ft_resetAfterRender();
		for (const route of this.routes) {
			if (route.path === path || route.path === "") {
				this.current_view = new route.viewmodel();
				break ;
			}
		}
	}

	public	ft_exit(): void {
		if (this.current_view)
			this.current_view.ft_dispose();
		process.exit(0);
	}
}
