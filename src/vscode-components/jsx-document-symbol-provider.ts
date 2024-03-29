import { writeFileSync } from 'fs';
import path from 'path'
import * as vscode from 'vscode';
import { IOutputJSON } from '../services/parseJSXtoJSON';
import { parseJSXtoJSONfromFile } from '../services/parseJSXtoJSONfromFile';


export class JSXDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
		try {

			const fileText = document.getText();
			const jsonForTreeView = parseJSXtoJSONfromFile(fileText);

			const parsed = jsonForTreeView.map(transformOutputJsonToSymbol);
			vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri).then(symbols => {

				writeFileSync(path.resolve(__dirname, './symbols.json'), JSON.stringify(symbols, null, 2))
			})

			return parsed;
		} catch (e) {
			console.log("🚀 ~ file: jsx-document-symbol-provider.ts ~ line 16 ~ JSXDocumentSymbolProvider ~ provideDocumentSymbols ~ e", e)
		}


	}
}

function transformOutputJsonToSymbol(jsonOutput: IOutputJSON): vscode.DocumentSymbol {
	if (!jsonOutput.sourceLocation.start || !jsonOutput.sourceLocation.end) {
		throw new Error('Invalid sourceLocation');
	}
	const range = new vscode.Range(
		new vscode.Position(jsonOutput.sourceLocation.start.line - 1, jsonOutput.sourceLocation.start.column),
		new vscode.Position(jsonOutput.sourceLocation.end.line - 1, jsonOutput.sourceLocation.end.column)
	);
	const newSymbol = new vscode.DocumentSymbol(jsonOutput.type, jsonOutput.otherThanChildrenProps,
		vscode.SymbolKind.Variable,
		range,
		range,
	);
	newSymbol.children = jsonOutput.nested?.map(transformOutputJsonToSymbol) || [];
	return newSymbol;
}