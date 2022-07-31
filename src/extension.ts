import * as vscode from 'vscode';
import { TextDecoder } from 'util';
import { parseJSXtoJSONfromFile } from './services/parseJSXtoJSONfromFile';
import { TestHierarchyProvider } from './vscode-components/test-hierachy-provider';
import { JSXDocumentSymbolProvider } from './vscode-components/jsx-document-symbol-provider';

export function activate(context: vscode.ExtensionContext) {
	const selector: vscode.DocumentFilter[] = [];
    for (const language of ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']) {
        selector.push({ language, scheme: 'file' });
        selector.push({ language, scheme: 'untitled' });
	}
	const disposableDocumentProvider = vscode.languages.registerDocumentSymbolProvider(selector, new JSXDocumentSymbolProvider(), {
		label: 'jsx'
	});
	context.subscriptions.push(disposableDocumentProvider);
}
