const ts = require('typescript');
const fs = require('fs');
const text = fs.readFileSync('src/App.tsx', 'utf8');
const srcFile = ts.createSourceFile('src/App.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const diags = srcFile.parseDiagnostics;
if (diags.length === 0) {
  console.log('NO_PARSE_DIAGS');
} else {
  diags.forEach(d => {
    const pos = srcFile.getLineAndCharacterOfPosition(d.start);
    console.log(`${pos.line+1}:${pos.character+1} ${d.messageText}`);
  });
  process.exit(1);
}
