import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { promisify } from 'node:util';

const run = promisify(execFile);
const script = path.resolve(import.meta.dirname, '../install.sh');

async function fixture(t, { npmFailures = 0, versionFailures = 0 } = {}) {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'groma-install-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bin = path.join(root, 'bin');
  const temporary = path.join(root, 'runner temp');
  await mkdir(bin);
  await mkdir(temporary);
  const callsFile = path.join(root, 'calls.jsonl');
  const outputFile = path.join(root, 'output');
  await writeFile(callsFile, '');
  const mock = `#!${process.execPath}
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const command = path.basename(process.argv[1]);
const args = process.argv.slice(2);
const calls = fs.readFileSync(process.env.MOCK_CALLS, 'utf8').trim().split('\\n').filter(Boolean).map(JSON.parse);
const attempt = calls.filter(call => call.command === command).length + 1;
fs.appendFileSync(process.env.MOCK_CALLS, JSON.stringify({ command, args }) + '\\n');
if (command === 'npm') {
  assert.equal(args[0], 'install');
  assert.ok(args.includes('--global'));
  assert.ok(args.includes('--include=optional'));
  assert.equal(args.at(-1), 'groma.md@0.6.6');
  const directory = args[args.indexOf('--logs-dir') + 1];
  fs.writeFileSync(path.join(directory, 'npm-' + attempt + '.log'), 'npm attempt ' + attempt + '\\n');
  if (attempt <= Number(process.env.MOCK_NPM_FAILURES)) {
    console.error('npm download failed');
    process.exit(1);
  }
} else if (command === 'groma') {
  assert.deepEqual(args, ['--version']);
  if (attempt <= Number(process.env.MOCK_VERSION_FAILURES)) {
    console.error('missing platform package');
    process.exit(1);
  }
  console.log('0.6.6');
} else {
  assert.equal(command, 'sleep');
  assert.deepEqual(args, ['10']);
}
`;
  for (const command of ['npm', 'groma', 'sleep']) {
    await writeFile(path.join(bin, command), mock, { mode: 0o755 });
  }

  return async () => {
    await writeFile(outputFile, '');
    const result = await run('bash', ['--noprofile', '--norc', '-e', '-o', 'pipefail', script], {
      env: {
        ...process.env,
        PATH: bin + path.delimiter + process.env.PATH,
        RUNNER_TEMP: temporary,
        GITHUB_OUTPUT: outputFile,
        GROMA_VERSION: '0.6.6',
        MOCK_CALLS: callsFile,
        MOCK_NPM_FAILURES: String(npmFailures),
        MOCK_VERSION_FAILURES: String(versionFailures),
      },
    }).then(value => ({ ...value, code: 0 }), error => error);
    const outputs = Object.fromEntries((await readFile(outputFile, 'utf8')).trim().split('\n').map(line => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator), line.slice(separator + 1)];
    }));
    const calls = (await readFile(callsFile, 'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);
    return { ...result, outputs, calls };
  };
}

function commands(result) {
  return result.calls.map(call => call.command);
}

describe('Groma installation', { concurrency: true }, () => {
  it('verifies a successful install before writing the version, without sleeping', async t => {
    const install = await fixture(t);
    const result = await install();
    assert.equal(result.code, 0);
    assert.equal(result.outputs.version, '0.6.6');
    assert.deepEqual(commands(result), ['npm', 'groma']);
    assert.deepEqual(await readdir(result.outputs['logs-directory']), ['npm-1.log']);
  });

  it('retries installation when npm succeeds but the optional binary is missing', async t => {
    const install = await fixture(t, { versionFailures: 2 });
    const result = await install();
    assert.equal(result.code, 0);
    assert.equal(result.outputs.version, '0.6.6');
    assert.deepEqual(commands(result), ['npm', 'groma', 'sleep', 'npm', 'groma', 'sleep', 'npm', 'groma']);
    assert.match(result.stderr, /missing platform package/);
  });

  it('retries npm failures without running the old or missing Groma binary', async t => {
    const install = await fixture(t, { npmFailures: 1 });
    const result = await install();
    assert.equal(result.code, 0);
    assert.equal(result.outputs.version, '0.6.6');
    assert.deepEqual(commands(result), ['npm', 'sleep', 'npm', 'groma']);
  });

  for (const failure of ['npm', 'version']) {
    it(`fails after three ${failure} failures without writing a version or sleeping again`, async t => {
      const install = await fixture(t, failure === 'npm' ? { npmFailures: 3 } : { versionFailures: 3 });
      const result = await install();
      assert.equal(result.code, 1);
      assert.equal(result.outputs.version, undefined);
      assert.equal(result.calls.filter(call => call.command === 'npm').length, 3);
      assert.equal(result.calls.filter(call => call.command === 'groma').length, failure === 'npm' ? 0 : 3);
      assert.equal(result.calls.filter(call => call.command === 'sleep').length, 2);
      assert.notEqual(result.calls.at(-1).command, 'sleep');
      assert.match(result.stderr, /failed after 3 attempts/);
      assert.equal(result.outputs['logs-name'], path.basename(result.outputs['logs-directory']));
      assert.deepEqual((await readdir(result.outputs['logs-directory'])).sort(), ['npm-1.log', 'npm-2.log', 'npm-3.log']);
    });
  }

  it('keeps separate log directories and artifact names for repeated invocations', async t => {
    const install = await fixture(t, { versionFailures: 99 });
    const first = await install();
    const second = await install();
    assert.equal(first.code, 1);
    assert.equal(second.code, 1);
    assert.notEqual(first.outputs['logs-directory'], second.outputs['logs-directory']);
    assert.notEqual(first.outputs['logs-name'], second.outputs['logs-name']);
    assert.equal((await readdir(first.outputs['logs-directory'])).length, 3);
    assert.equal((await readdir(second.outputs['logs-directory'])).length, 3);
  });
});
