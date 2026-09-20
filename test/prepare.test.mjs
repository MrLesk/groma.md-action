import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { promisify } from 'node:util';

const run = promisify(execFile);
const script = path.resolve(import.meta.dirname, '../prepare.mjs');
const fixture = path.join(import.meta.dirname, 'fixtures/project');

async function checkout(t, initialized = true) {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'groma-action-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  if (initialized) await cp(fixture, root, { recursive: true });
  return root;
}

async function prepare(root, exclude = '') {
  const outputFile = path.join(root, 'action-output');
  await writeFile(outputFile, '');
  await run(process.execPath, [script], {
    cwd: root,
    env: { ...process.env, GROMA_EXCLUDE: exclude, GROMA_OUTPUT: 'site/architecture map', GITHUB_OUTPUT: outputFile },
  });
  return Object.fromEntries((await readFile(outputFile, 'utf8')).trim().split('\n').map(line => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));
}

describe('workflow configuration', { concurrency: true }, () => {
  it('appends literal ordered patterns while retaining scanner selections and settings', async t => {
    const root = await checkout(t);
    const filename = path.join(root, 'groma/scanners.json');
    const config = JSON.parse(await readFile(filename, 'utf8'));
    config.scanners[0].settings = { input: 'src/client.js' };
    await writeFile(filename, JSON.stringify(config));
    const result = await prepare(root, '/examples/\r\n!examples/keep.js\r\n\n');
    const actual = JSON.parse(await readFile(filename, 'utf8'));
    assert.deepEqual(actual.scanners, config.scanners);
    assert.deepEqual(actual.exclude, ['**/*.generated.*', '/examples/', '!examples/keep.js']);
    assert.equal(result.output, path.join(root, 'site/architecture map'));
  });

  for (const directory of ['groma', '.groma']) {
    it('preserves an unchanged configuration in ' + directory, async t => {
      const root = await checkout(t);
      if (directory === '.groma') await rename(path.join(root, 'groma'), path.join(root, directory));
      const filename = path.join(root, directory, 'scanners.json');
      const before = await readFile(filename, 'utf8');
      await prepare(root, ' \n');
      assert.equal(await readFile(filename, 'utf8'), before);
    });
  }

  it('requires initialization without creating a project', async t => {
    const root = await checkout(t, false);
    await assert.rejects(prepare(root), error => error.code !== 0 && error.stderr.includes('groma init'));
    assert.deepEqual(await readdir(root), ['action-output']);
  });

  it('keys scanner packages by their sources, independently of scan exclusions', async t => {
    const root = await checkout(t);
    const first = await prepare(root);
    const excluded = await prepare(root, '/examples/');
    assert.equal(first['scanner-key'], excluded['scanner-key']);
    const filename = path.join(root, 'groma/scanners.json');
    const config = JSON.parse(await readFile(filename, 'utf8'));
    config.scanners[0].source = '@groma/scanner-javascript@0.2.0';
    await writeFile(filename, JSON.stringify(config));
    const upgraded = await prepare(root);
    assert.notEqual(upgraded['scanner-key'], first['scanner-key']);
  });
});
