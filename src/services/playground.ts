import { readFileSync } from 'fs';
import path from 'path'
import { parseJSXfromFile  } from './parseJSXfromFile';

const content =  readFileSync(path.resolve(__dirname, '../lab-files/two-component.jsx'), {
	encoding: 'utf8'
});

parseJSXfromFile(content);