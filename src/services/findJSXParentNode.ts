import { NodePath } from "@babel/traverse";

export function findJSXParentNode(path: NodePath) {
	let thatNode;
	console.log("🚀 ~ file: findJSXParentNode.ts ~ line 6 ~ findJSXParentNode ~ path.parentPath", path.parentPath)
	console.log("🚀 ~ file: findJSXParentNode.ts ~ line 7 ~ findJSXParentNode ~ path.parentPath.node", path.parentPath.node)
	do {
		path = path.parentPath;
		if (path.parentPath && path.parentPath.node && (path.parentPath.node as any).__node) {
			thatNode = path.parentPath.node;
		}
	} while (path.parentPath && path.parentPath.node && !(path.parentPath.node as any).__node)

	return thatNode;
}