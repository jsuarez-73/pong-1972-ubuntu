import { NodeTree } from "@core/node";

export class	Tree<T> {

	private	root: NodeTree<T>;

	constructor(root: NodeTree<T>) {
		this.root = root;
		this.root.parent = undefined;
	}

	private	ft_traverseChildren(node: NodeTree<T>, parent: NodeTree<T> | undefined, strategy: (node: NodeTree<T>, parent: NodeTree<T> | undefined) => void): void {
		strategy(node, parent);
		node.children.forEach((child: NodeTree<T>) => {
			this.ft_traverseChildren(child, child.parent, strategy);
		});
	}

	public	ft_traverseTree(strategy: (node: NodeTree<T>, parent?: NodeTree<T>) => void): void {
		this.ft_traverseChildren(this.root, undefined, strategy);
	}
}
