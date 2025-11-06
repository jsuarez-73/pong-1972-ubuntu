type	INode<T> = {
	value: T,
	parent?: NodeTree<T>,
	children?: NodeTree<T>[]
};

