import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const directory = process.argv[2];
let snapshot;
vm.runInNewContext(await readFile(path.join(directory, 'snapshot.js'), 'utf8'), {
  globalThis: { dispatchEvent: event => { snapshot = event.detail; } },
  CustomEvent: class {
    constructor(type, event) { this.detail = event.detail; }
  },
});

assert.equal(snapshot.delivery.kind, 'published');
const sources = Array.from(snapshot.delivery.reads.sources, item => item.file).sort();
assert.deepEqual(sources, ['src/catalog.ts', 'src/client.js']);
console.log('Both scanners contributed source; generated files and excluded examples are absent.');
