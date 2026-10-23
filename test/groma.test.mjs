import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { it } from 'node:test';
import { runGroma } from '../groma.mjs';

it('starts the installed launcher without a shell or PATH and preserves arguments, Git settings and exit status',
  { concurrency: true }, async t => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'groma launcher '));
    t.after(() => rm(root, { recursive: true, force: true }));
    const launcher = path.join(root, 'installed launcher.cjs');
    await writeFile(launcher, `console.log(JSON.stringify({ args: process.argv.slice(2),
      ca: process.env.GIT_SSL_CAINFO, proxy: process.env.GIT_PROXY_SSL_CAINFO })); process.exitCode = 6;`);
    const args = ['export', 'a path with spaces', 'literal&value', '$(literal)', '"quoted"'];
    await assert.rejects(runGroma(args, { cwd: root, env: { ...process.env, PATH: '', GROMA_CLI: launcher,
      GIT_SSL_CAINFO: 'caller-ca.pem', GIT_PROXY_SSL_CAINFO: 'caller-proxy.pem' } }), error => {
      assert.equal(error.code, 6);
      assert.deepEqual(JSON.parse(error.stdout), { args, ca: 'caller-ca.pem', proxy: 'caller-proxy.pem' });
      return true;
    });
  });
