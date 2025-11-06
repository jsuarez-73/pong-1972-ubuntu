import { e_DIRECTION } from "@cli-types/enums";
import { NodeTree, Tree } from "@segfaultx/container";
import { ViewElement } from "@shared/element/element";

export class	ComposedElement<T extends ViewElement> {

	protected	elements: T[] = [];
	protected	arrange: Tree<ArrangeConfig> | undefined;

	constructor (elements?: T[]) {
		if (elements)
			elements.forEach((element: T) => {
				this.elements.push(element);
			});
	}

	public	ft_getElements(): T[] {
		return ([...this.elements]);
	}

	public	ft_appendElement(...elements: T[]): void {
		elements.forEach((element: T) => {
			this.elements.push(element);
		});
	}

	private	ft_arrangeDirection(node: ArrangeConfig, parent?: ViewElement): void {
		const	relative = node.relative;
		let		start = {x: 0, y: 0};
		if (relative === undefined)
			return ;
		let	pad: number;
		if (relative.computed_padding !== undefined) {
			pad = relative.computed_padding();
			pad = (pad < 0) ? 0 : pad;
		}
		else
			pad = relative.padding ?? 0;
		const	end_parent: Coord = parent?.ft_getEnd() ?? {x: 0, y: 0};
		const	start_parent: Coord = parent?.ft_getStart() ?? {x: 0, y: 0};
		const	element_size = node.element.ft_getSize();
		switch (relative.direction) {
			case e_DIRECTION.FLEX_RIGHT:
				start.x = end_parent.x + pad;
				start.y = start_parent.y;
				break ;
			case e_DIRECTION.FLEX_LEFT:
				start.x = start_parent.x - pad - element_size.x;
				start.y = start_parent.y;
				break ;
			case e_DIRECTION.BLOCK_UP:
				start.x = start_parent.x;
				start.y = start_parent.y - pad - element_size.y;
				break ;
			default: 
				start.x = start_parent.x;
				start.y = end_parent.y + pad;
		}
		node.element.ft_setStart(start);
	}

	private	ft_setArrangeElement(child: ArrangeConfig, parent: ViewElement | undefined): void {
			if (child.start !== undefined)
				child.element.ft_setStart(child.start);
			else if (child.relative !== undefined) {
				this.ft_arrangeDirection(child, parent);
			}
	}

	public	ft_arrangeElements(): void {
		if (this.arrange === undefined)
			return ;
		this.arrange.ft_traverseTree((node: NodeTree<ArrangeConfig>, parent: NodeTree<ArrangeConfig> | undefined) => {
			this.ft_setArrangeElement(node.value, parent?.value.element);
		});
	}

	private	ft_assertArrange(arrange: ArrangeConfig): void {
		const	rel = arrange.relative;
		if (rel !== undefined) {
			if (rel.padding !== undefined && rel.padding < 0)
				rel.padding = 0;
			if (rel.direction !== undefined) {
				if (rel.direction < e_DIRECTION.BLOCK_UP ||
					rel.direction > e_DIRECTION.FLEX_RIGHT)
					rel.direction = e_DIRECTION.BLOCK_DOWN;
			}
		}
	}

	public	ft_modifyArrange(...mods: ArrangeConfig[]): ComposedElement<T> {
		this.arrange?.ft_traverseTree((node: NodeTree<ArrangeConfig>, parent: NodeTree<ArrangeConfig> | undefined) => {
			const	arrange_found = mods.find((mod: ArrangeConfig) => mod.element === node.value.element);
			if (arrange_found) {
				this.ft_assertArrange(arrange_found);
				node.value.start = arrange_found.start ?? node.value.start;
				if (node.value.relative !== undefined) {
					node.value.relative.direction = arrange_found.relative?.direction ?? node.value.relative.direction;
					node.value.relative.padding = arrange_found.relative?.padding ?? node.value.relative.padding;
				}
				else if (arrange_found.relative !== undefined) {
					if (arrange_found.relative.direction !== undefined)
						Object.defineProperty(node.value.relative, "direction", {
							value: arrange_found.relative.direction,
							configurable: true,
							writable: true,
							enumerable: true
						});
					if (arrange_found.relative.padding !== undefined)
						Object.defineProperty(node.value.relative, "padding", {
							value: arrange_found.relative.padding,
							configurable: true,
							writable: true,
							enumerable: true
						});
				}
			}
			this.ft_setArrangeElement(node.value, parent?.value.element);
		});
		return (this);
	}

	public	ft_setArrangeConfig(arrange: Tree<ArrangeConfig>): void {
		this.arrange = arrange;
	}

	public	ft_removeElement(...elements: T[]): void {
		this.elements = this.elements.filter((element: T) => {
			return (! elements.find((element_rem) => element_rem === element));
		});
	}

	public	ft_getComposedSize(): Coord {
		let	acum: Coord = {x: 0, y: 0};
		this.elements.forEach((element: ViewElement) => {
			let	el_size = element.ft_getSize();
			acum.x += el_size.x;
			acum.y += el_size.y;
		});
		return (acum);
	}

	public	ft_getGroupSize(): Coord {
		let	min = {x: 0, y: 0};
		let	max = {x: 0, y: 0};
		let	start, end: Coord = {x: 0, y: 0};
		this.arrange?.ft_traverseTree((node: NodeTree<ArrangeConfig>) => {
			start = node.value.element.ft_getStart();
			end = node.value.element.ft_getEnd();
			if (node.ft_getTag() === "root")
				({x: min.x, y: min.y} = start);
			if (start.x < min.x)
				min.x = start.x;
			if (start.y < min.y)
				min.y = start.y;
			if (end.x > max.x)
				max.x = end.x;
			if (end.y > max.y)
				max.y = end.y;
		});
		return ({x: max.x - min.x, y: max.y - min.y});
	}
}
