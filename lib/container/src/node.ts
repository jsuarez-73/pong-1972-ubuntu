
export class	NodeTree<T> {
	public	value: T;
	public	parent: NodeTree<T> | undefined
	public	children: NodeTree<T>[] = [];

	constructor (node: INode<T>) {
		({value: this.value, parent: this.parent} = node);
		if (node.children !== undefined) {
			this.ft_attachChildren(...node.children);
		}
	}

	public	ft_getTag(): "root" | "node" | "leaf" {
		if (this.parent === undefined)
			return ("root");
		else if (this.children.length !== 0)
			return ("node");
		else
			return ("leaf");
	}

	public	ft_attachChildren(...children: NodeTree<T>[]): NodeTree<T> {
		children.forEach((child: NodeTree<T>) => {
			child.ft_setParent(this);
			this.children.push(child);
		});
		return (this);
	}

	public	ft_setParent(parent: NodeTree<T>): NodeTree<T> {
		this.parent = parent;
		return (this);
	}
}
