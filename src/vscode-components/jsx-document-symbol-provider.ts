import * as vscode from 'vscode';
import { IOutputJSON } from '../services/parseJSXtoJSON';
import { parseJSXtoJSONfromFile } from '../services/parseJSXtoJSONfromFile';


export class JSXDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
			console.log('at provide document: ', document.uri)
			vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri).then(symbols =>  console.log(symbols));
			const fileText = document.getText();
			const jsonForTreeView = parseJSXtoJSONfromFile(fileText);
			const parsed = [transformOutputJsonToSymbol(jsonForTreeView)];
			console.log('custom provider triggered: ', parsed);
			return parsed;
	}
}

function transformOutputJsonToSymbol(jsonOutput: IOutputJSON): vscode.DocumentSymbol {
	const range =  new vscode.Range(
		new vscode.Position(jsonOutput.sourceLocation.line - 1, jsonOutput.sourceLocation.column),
		new vscode.Position(jsonOutput.sourceLocation.line - 1, jsonOutput.sourceLocation.column + 1)
	);
	return {
		name: jsonOutput.type,
		detail: jsonOutput.otherThanChildrenProps,
		kind: vscode.SymbolKind.Object,
		range,
		selectionRange: range,
		children: jsonOutput.nested?.map(transformOutputJsonToSymbol) || [],
	};
}