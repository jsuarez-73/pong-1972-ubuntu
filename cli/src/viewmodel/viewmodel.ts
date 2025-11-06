import { e_GAME_CONSTANTS } from "@cli-types/enums";
import { KeyboardService } from "@services/keyboard/keyboard.service";
import { Router } from "@services/router/router.service";
import { ViewService } from "@services/view/view.service";
import { ViewElement } from "@shared/element/element";
import { ChildViewModel } from "@viewmodel/child-viewmodel";

export abstract class	ViewModel<T> {
	
	protected	sc_size: Coord = this.view_service.sc_size;
	protected	sc_index: Coord = this.view_service.sc_index;
	protected	rate_scperpx_x: number = this.sc_size.x / e_GAME_CONSTANTS.WIDTH;
	protected	rate_scperpx_y: number = this.sc_size.y / e_GAME_CONSTANTS.HEIGHT;
	protected	elements: ListElements = {};
	protected	children: ListChildren = {};
	protected	context: Context = {};
	protected	child_view: Set<ChildViewModel> = new Set();
	protected	focusable: ViewElement[] = [];
	private		focused: number = 0;
	private		handle_object: Listener = this.ft_handleKeys.bind(this);

	constructor (
		protected	model: T,
		protected	keyboard: KeyboardService = new KeyboardService(),
		protected	view_service: ViewService = new ViewService(),
		protected	router: Router = new Router(),
	) {
		this.keyboard.ft_subscribeToKeys(this.handle_object);
		Object.assign(this.context, {
			ft_startRelativeTo: this.ft_startRelativeTo
		});
	}

	/*[!PENDING]: The derived elements must handle their disposal as decorator
	* pattern.*/
	public	ft_dispose(): void {
		this.keyboard.ft_removeListener(this.handle_object);
	};

	protected	ft_setFocusable(...element: ViewElement[]): void {
		this.focusable = element;
		this.focusable[this.focused].ft_focus();
	}

	protected	ft_moveFocusForward(): void {
		this.ft_getFocused().ft_disableFocus();
		if (this.focused === this.focusable.length - 1)
			this.focused = 0;
		else
			this.focused++;
		this.focusable[this.focused].ft_focus();
	}

	protected	ft_moveFocusBackward(): void {
		this.ft_getFocused().ft_disableFocus();
		if (this.focused === 0 && this.focusable.length > 0)
			this.focused = this.focusable.length - 1;
		else
			this.focused--;
		this.focusable[this.focused].ft_focus();
	}

	protected	ft_getFocused(): ViewElement {
		return (this.focusable[this.focused]);
	}

	public	ft_startRelativeTo(relative: Coord, x: number, y: number): Coord {
		return ({
			x: relative.x + x,
			y: relative.y + y
		});
	}

	protected	ft_setParentElements(elements: ListElements): void {
		for (let key in elements) {
			if (elements[key] instanceof ViewElement)
				Object.defineProperty(this.elements, key, {
					value: elements[key],
					enumerable: true,
					configurable: true
				});
		}
	}

	protected	ft_setContext(context: Context): void {
		for (let key in context) {
				Object.defineProperty(this.context, key, {
					value: context[key],
					enumerable: true,
					configurable: true
				});
		}
	}

	protected	ft_setChildren(children: ListChildrenConstructor) : void {
		for (let key in children) {
			if (children[key] instanceof ChildViewModel.constructor)
				Object.defineProperty(this.children, key, {
					value: new children[key](this.context),
					enumerable: true,
					configurable: true
				});
		}
	}

	protected	ft_pushChildViewModel(...children_names: string[]): void {
		children_names.forEach((child_name) => {
			if (this.children[child_name] !== undefined)
				this.child_view.add(this.children[child_name]);
		});
	}

	protected	ft_popChildViewModel(...children_names: string[]): void {
		children_names.forEach( (child_name) => {
			this.child_view.delete(this.children[child_name])
		});
	}

	protected	ft_popAllChildren(): void {
		this.child_view.clear();
	}

	protected	ft_getChildrenOnView(): ChildViewModel[] {
		return ([...this.child_view.values()]);
	}

	protected	ft_hasChildOnView(name: string): boolean {
		return (this.child_view.has(this.children[name]));
	}

	protected async ft_render(): Promise<void> {
		let	children_elements: ViewElement[] = [];
		this.child_view.forEach((child) => children_elements.push(...child.ft_getElements()));
		let	elements = [...Object.values(this.elements), ...children_elements];
		await this.view_service.ft_renderElements(elements);
	}

	protected abstract	ft_handleKeys(char: string, key: Key): void;
}
