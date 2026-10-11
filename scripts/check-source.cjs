const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const root = path.resolve(__dirname, '..');
const globals = new Set([
  'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'fetch', 'URL', 'URLSearchParams', 'AbortController', 'window', 'document', 'navigator', 'indexedDB',
  'Blob', 'FileReader', 'TextEncoder', 'TextDecoder', 'crypto', 'atob', 'btoa',
  'require', 'module', 'exports', 'process', '__dirname', '__DEV__',
]);
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : /\.(js|mjs)$/.test(file) ? [file] : [];
  });
}
let failures = 0;
const sources = [path.join(root, 'App.js'), ...files(path.join(root, 'src'))];
for (const file of sources) {
  const ast = parser.parse(fs.readFileSync(file, 'utf8'), { sourceType: 'unambiguous', plugins: ['jsx'] });
  traverse(ast, { ReferencedIdentifier(reference) {
    const name = reference.node.name;
    if (reference.scope.hasBinding(name) || globals.has(name)) return;
    console.error(`${path.relative(root, file)}:${reference.node.loc.start.line}: undefined identifier ${name}`);
    failures++;
  } });
}
if (failures) process.exitCode = 1;
else console.log(`Checked bindings in ${sources.length} application source files.`);
