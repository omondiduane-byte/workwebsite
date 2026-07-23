
const ts = require('typescript');
const fs = require('fs');
const src = fs.readFileSync('src/App.tsx','utf8');
const sf = ts.createSourceFile('src/App.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const diagnostics = sf.parseDiagnostics;
console.log(JSON.stringify(diagnostics.map(d => ({start: d.start, length: d.length, code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, '\n')}))));
