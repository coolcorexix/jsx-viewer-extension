import { type } from 'os';
import * as vscode from 'vscode';
import { IOutputJSON } from '../services/parseJSXtoJSON';
import { parseJSXtoJSONfromFile } from '../services/parseJSXtoJSONfromFile';

type IJsxBrowsingHierarchyItem =  vscode.CallHierarchyItem & {jsxBrowsing?: IOutputJSON};

export class TestHierarchyProvider implements vscode.CallHierarchyProvider {
    
    prepareCallHierarchy(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.CallHierarchyItem | undefined {
        vscode.window.showInformationMessage('prepareCallHierarchy');
        const fileText = document.getText();
        const jsonForTreeView = parseJSXtoJSONfromFile(fileText);
  
        return this.createJsxBrowsingHierarchyItem(
            document,
            jsonForTreeView
        );
    }

    provideCallHierarchyOutgoingCalls() {
        const outgoingCallItems: vscode.CallHierarchyOutgoingCall[] = [];
		return outgoingCallItems;
    }
    
    async provideCallHierarchyIncomingCalls(item: IJsxBrowsingHierarchyItem, token: vscode.CancellationToken) {
        let editor = vscode.window.activeTextEditor;   
        if (!editor) {
            return null;
        }
        const document = await vscode.workspace.openTextDocument(item.uri);
        const incomingCallItems: vscode.CallHierarchyIncomingCall[] = [];
        if (item.jsxBrowsing && item.jsxBrowsing.nested) {
            item.jsxBrowsing.nested.forEach(child => {
                const newItem: IJsxBrowsingHierarchyItem = this.createJsxBrowsingHierarchyItem(
                    document,
                    child
                );
                const incomingCallItem = new vscode.CallHierarchyIncomingCall(newItem, [newItem.range]);
                incomingCallItems.push(incomingCallItem);
            });
        }
        return incomingCallItems;
    }

    private createJsxBrowsingHierarchyItem(document: vscode.TextDocument, json: IOutputJSON): IJsxBrowsingHierarchyItem {
        const range =  new vscode.Range(
            new vscode.Position(json.sourceLocation.line - 1, json.sourceLocation.column),
            new vscode.Position(json.sourceLocation.line - 1, json.sourceLocation.column + 1)
        );
        const newItem: IJsxBrowsingHierarchyItem = new vscode.CallHierarchyItem(vscode.SymbolKind.Object,
            json.type, json.otherThanChildrenProps,
            document.uri,
            range, range);
        newItem.jsxBrowsing = json;
        return newItem;
    }
}