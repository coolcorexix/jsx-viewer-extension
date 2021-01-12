import * as vscode from 'vscode';
import { TextDecoder } from 'util';
import { parseJSXtoJSONfromFile } from './services/parseJSXtoJSONfromFile';
import { TestHierarchyProvider } from './vscode-components/test-hierachy-provider';

export function activate(context: vscode.ExtensionContext) {
	const selector: vscode.DocumentFilter[] = [];
    for (const language of ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']) {
        selector.push({ language, scheme: 'file' });
        selector.push({ language, scheme: 'untitled' });
	}
	const disposable3 = vscode.languages.registerCallHierarchyProvider(selector, new TestHierarchyProvider());
	context.subscriptions.push(disposable3);
}
