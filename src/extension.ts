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
	const disposable3 = vscode.languages.registerCallHierarchyProvider([...selector, {
		scheme: 'file',
		pattern: '**/*.trx',
	}, 'plaintext'], 
		new TestHierarchyProvider());
	context.subscriptions.push(disposable3);
	showSampleText(context);
}

export function deactixvate() {}

async function showSampleText(context: vscode.ExtensionContext): Promise<void> {
	const sampleTextEncoded = await vscode.workspace.fs.readFile(vscode.Uri.file(context.asAbsolutePath('TestComponent.trx')));
	const sampleText = new TextDecoder('utf-8').decode(sampleTextEncoded);
	const doc = await vscode.workspace.openTextDocument({ language: 'plaintext', content: sampleText });
	vscode.window.showTextDocument(doc);
}
