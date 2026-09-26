import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { it } from 'node:test';
import { exportComparison, readPayload, summarize } from '../comparison.mjs';

const payload = {
  revision: { id: 'b'.repeat(40) },
  comparison: {
    from: { id: 'a'.repeat(40) },
    components: { a: { status: 'added' }, b: { status: 'modified' }, c: { status: 'unchanged' } },
    relationships: { a: 'removed', b: 'unchanged' },
  },
};

it('counts only changes reported by Groma and preserves both commit identities', { concurrency: true }, () => {
  assert.deepEqual(summarize(payload), {
    from: 'a'.repeat(40), revision: 'b'.repeat(40),
    components: { added: 1, modified: 1, removed: 0 },
    relationships: { added: 0, modified: 0, removed: 1 },
  });
  assert.throws(() => readPayload('<script>throw new Error("must not execute")</script>'));
});

for (const fail of [false, true]) {
  it(`disables scanner hooks and restores the exact config after ${fail ? 'failed' : 'successful'} export`, { concurrency: true }, async t => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'groma-comparison-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    const configFile = path.join(root, 'scanners.json');
    const original = '{ "scanners": [{"source":"./local-scanner"}], "exclude": ["test/"] }\n';
    await writeFile(configFile, original);
    const execute = async (command, args) => {
      assert.equal(command, 'groma');
      assert.deepEqual(args, ['export', root, '--from', 'before', '--revision', 'after']);
      assert.deepEqual(JSON.parse(await readFile(configFile, 'utf8')), { scanners: [], exclude: ['test/'] });
      if (fail) throw new Error('export failed');
      await writeFile(path.join(root, 'index.html'), `<script type="application/json" id="world">${JSON.stringify(payload)}</script>`);
    };
    const exported = exportComparison({ configFile, directory: root, from: 'before', revision: 'after', execute });
    if (fail) await assert.rejects(exported, /export failed/);
    else assert.deepEqual(JSON.parse(await readFile(await exported, 'utf8')), summarize(payload));
    assert.equal(await readFile(configFile, 'utf8'), original);
  });
}
