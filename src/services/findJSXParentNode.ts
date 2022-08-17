// @ts-nocheck
import { NodePath } from "@babel/traverse";

export function findJSXParentNode(path: NodePath) {
	let thatNode;
	do {
		path = path.parentPath;
		if (path.parentPath && path.parentPath.node && (path.parentPath.node as any).__node) {
			thatNode = path.parentPath.node;
		}
	} while (path.parentPath && path.parentPath.node && !(path.parentPath.node as any).__node)

	return thatNode;
}