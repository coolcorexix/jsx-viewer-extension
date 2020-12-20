import * as vscode from 'vscode';
import { TextDecoder } from 'util';
import { parseJSXtoJSONfromFile } from './services/parseJSXtoJSONfromFile';
import { TestHierarchyProvider } from './vscode-components/test-hierachy-provider';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('helloworldofextension.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from helloworldofextension!');
	});

	let disposable2 = vscode.commands.registerCommand('helloworldofextension.jsxTreeView', () => {
		const editor: vscode.TextEditor | undefined =
        	vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const fileText = editor.document.getText();
		const jsonForTreeView = parseJSXtoJSONfromFile(fileText);
		vscode.window.showInformationMessage(editor.document.getText());
	});

	const disposable3 = vscode.languages.registerCallHierarchyProvider('plaintext', new TestHierarchyProvider());

	// context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	showSampleText(context);
}

export function deactivate() {}

async function showSampleText(context: vscode.ExtensionContext): Promise<void> {
	const sampleTextEncoded = await vscode.workspace.fs.readFile(vscode.Uri.file(context.asAbsolutePath('TestComponent.txt')));
	const sampleText = new TextDecoder('utf-8').decode(sampleTextEncoded);
	const doc = await vscode.workspace.openTextDocument({ language: 'plaintext', content: sampleText });
	vscode.window.showTextDocument(doc);
}
