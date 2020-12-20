import { parseJSXfromFile } from './parseJSXfromFile';
import { parseJSXtoJSON } from './parseJSXtoJSON';

export function parseJSXtoJSONfromFile(fileStringContent: string) {
    const outputJSX = parseJSXfromFile(fileStringContent);
    const outputJSON = parseJSXtoJSON(outputJSX);

    return outputJSON;
}