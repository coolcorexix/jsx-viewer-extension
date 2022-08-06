import { parseJSXfromFile } from './parseJSXfromFile';
import { IOutputJSON, parseJSXtoJSON } from './parseJSXtoJSON';


export function parseJSXtoJSONfromFile(fileStringContent: string): IOutputJSON[] {
    const outputJSXs = parseJSXfromFile(fileStringContent);

    const outputJSONs = outputJSXs.map(outputJSX => parseJSXtoJSON(outputJSX));

    return outputJSONs;
}