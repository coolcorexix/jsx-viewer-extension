import * as vscode from 'vscode';
import { IOutputJSON } from '../services/parseJSXtoJSON';
import { parseJSXtoJSONfromFile } from '../services/parseJSXtoJSONfromFile';


export class JSXDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
		try {
			console.log('at provide document: ', document.uri);
			const fileText = document.getText();
			const jsonForTreeView = parseJSXtoJSONfromFile(fileText);
            console.log("🚀 ~ file: jsx-document-symbol-provider.ts ~ line 12 ~ JSXDocumentSymbolProvider ~ provideDocumentSymbols ~ jsonForTreeView", jsonForTreeView)
			const parsed =  jsonForTreeView.map(transformOutputJsonToSymbol);
			console.log('custom provider triggered: ', parsed);
			return parsed;
		} catch (e) {
        console.log("🚀 ~ file: jsx-document-symbol-provider.ts ~ line 16 ~ JSXDocumentSymbolProvider ~ provideDocumentSymbols ~ e", e)

		}
		

	}
}

function transformOutputJsonToSymbol(jsonOutput: IOutputJSON): vscode.DocumentSymbol {
	const range =  new vscode.Range(
		new vscode.Position(jsonOutput.sourceLocation.line - 1, jsonOutput.sourceLocation.column),
		new vscode.Position(jsonOutput.sourceLocation.line - 1, jsonOutput.sourceLocation.column + 1)
	);
	const newSymbol =  new vscode.DocumentSymbol(jsonOutput.type, jsonOutput.otherThanChildrenProps,
		vscode.SymbolKind.Field,
		range,
		range,
	);
	newSymbol.children = jsonOutput.nested?.map(transformOutputJsonToSymbol) || [];
	return newSymbol;
}