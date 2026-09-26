import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { readPayload } from '../comparison.mjs';

const directory = process.argv[2];
const snapshot = readPayload(await readFile(path.join(directory, 'index.html'), 'utf8'));
assert.equal(snapshot.delivery.kind, 'published');
const sources = snapshot.delivery.views[0].reads.sources.map(item => item.file).sort();
assert.deepEqual(sources, ['src/catalog.ts', 'src/client.js']);
console.log('Both scanners contributed source; generated files and excluded examples are absent.');
