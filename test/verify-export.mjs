import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { readPayload } from '../comparison.mjs';

const directory = process.argv[2];
const snapshot = readPayload(await readFile(path.join(directory, 'index.html'), 'utf8'));
assert.equal(snapshot.delivery.kind, 'published');
const sources = snapshot.delivery.views[0].reads.sources.map(item => item.file).sort();
assert.deepEqual(sources, ['src/catalog.ts', 'src/client.js']);
if (process.argv[3] === 'comparison') {
  const summary = JSON.parse(await readFile(path.join(directory, 'comparison.json'), 'utf8'));
  assert.deepEqual(summary.components, { added: 0, modified: 1, removed: 0 });
  assert.deepEqual(summary.relationships, { added: 0, modified: 0, removed: 0 });
  assert.equal(existsSync('scanner-executed'), false, 'Comparison must not execute the local scanner module');
  const after = snapshot.delivery.views[1].reads.sources.find(item => item.file === 'src/client.js');
  assert.match(after.source.source, /updated catalog/);
  console.log('Committed source changes exported without scanner execution.');
} else {
  console.log('Both scanners contributed source; generated files and excluded examples are absent.');
}
