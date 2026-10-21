import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { X509Certificate, createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import tls from 'node:tls';
import { it } from 'node:test';
import { publicationGitEnvironment } from '../publish/publish.mjs';
import { blockedSPKI, filterAuthorities, npmAuthorities, trustSettings, prepareTrust, exportSettings,
  installArguments, installGroma, runNpm } from '../prepare-trust.mjs';

const fixture = path.join(import.meta.dirname, 'fixtures/certificate-trust');
const incidents = JSON.parse(await readFile(path.join(fixture, 'compromised-cas.json'), 'utf8')).certificates;
const privateCA = await readFile(path.join(fixture, 'registry-ca.pem'), 'utf8');
const certificates = pem => pem.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) ?? [];
const key = pem => createHash('sha256').update(new X509Certificate(pem).publicKey.export({ type: 'spki', format: 'der' })).digest('hex');
async function temporary(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'groma-trust-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

it('excludes every incident certificate variant by all twelve SPKI keys while preserving and deduplicating private roots', () => {
  assert.equal(blockedSPKI.size, 12);
  assert.deepEqual(new Set(incidents.map(c => key(c.pem))), blockedSPKI);
  const actual = certificates(filterAuthorities([...incidents.map(c => c.pem), privateCA, privateCA]));
  assert.equal(actual.length, 1);
  assert.equal(new X509Certificate(actual[0]).fingerprint256, new X509Certificate(privateCA).fingerprint256);
});

it('fails closed for empty, compromised-only, malformed and non-PEM trust', () => {
  for (const input of [[], incidents.map(c => c.pem), ['garbage'], ['-----BEGIN CERTIFICATE-----\ngarbage\n-----END CERTIFICATE-----']]) {
    assert.throws(() => filterAuthorities(input));
  }
});

it('unions bundled, default, system, extra and configured private CAs and creates an empty fallback directory', async t => {
  const root = await temporary(t), custom = path.join(root, 'custom.pem');
  await writeFile(custom, privateCA);
  const calls = [];
  const settings = prepareTrust({ directory: root, env: { SSL_CERT_FILE: custom }, bundled: [tls.rootCertificates[0]],
    getCertificates: kind => { calls.push(kind); return [privateCA, incidents[0].pem]; }, npmInputs: [] });
  assert.deepEqual(calls, ['default', 'system', 'extra']);
  const actual = certificates(await readFile(settings.SSL_CERT_FILE, 'utf8'));
  assert.equal(actual.length, 2);
  assert.ok(actual.some(pem => key(pem) === key(privateCA)));
  assert.deepEqual(await readdir(settings.SSL_CERT_DIR), []);
  assert.equal(settings.NODE_EXTRA_CA_CERTS, settings.SSL_CERT_FILE);
});

it('asks native npm for global-context cafile and CA settings without replacing auth/proxy handling', () => {
  const calls = [];
  const actual = npmAuthorities({ env: { token: 'kept' }, query: (args, options) => {
    calls.push(args); assert.equal(options.env.token, 'kept');
    return args[2] === 'cafile' ? '/custom/npm.pem' : JSON.stringify([privateCA]);
  }, read: filename => { assert.equal(filename, '/custom/npm.pem'); return privateCA; } });
  assert.deepEqual(calls, [['config', 'get', 'cafile', '--global'], ['config', 'get', 'ca', '--global', '--json']]);
  assert.deepEqual(actual, [privateCA, privateCA]);
});

it('preserves a real native npm global custom cafile and rejects unreadable configured CAs', async t => {
  const root = await temporary(t), global = path.join(root, 'global.npmrc'), user = path.join(root, 'user.npmrc');
  const cafile = path.join(root, 'corporate-ca.pem');
  await writeFile(cafile, privateCA); await writeFile(global, `cafile=${cafile}\n`); await writeFile(user, '');
  const env = { ...process.env, NPM_CONFIG_GLOBALCONFIG: global, NPM_CONFIG_USERCONFIG: user };
  for (const k of Object.keys(env)) if (/^npm_config_(cafile|ca)$/i.test(k)) delete env[k];
  assert.ok(npmAuthorities({ env }).some(pem => key(pem) === key(privateCA)));
  assert.throws(() => npmAuthorities({ query: args => args[2] === 'cafile' ? path.join(root, 'absent') : 'null' }), /ENOENT/);
});

it('preserves inherited Git settings and enforces Schannel CA-file use, strict TLS and empty trust fallbacks', () => {
  const env = { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.autocrlf', GIT_CONFIG_VALUE_0: 'input' };
  const settings = { ...env, ...trustSettings('/filtered.pem', '/empty', env) };
  assert.equal(settings.GIT_CONFIG_COUNT, '3');
  assert.equal(settings.GIT_CONFIG_KEY_0, 'core.autocrlf');
  assert.equal(settings.GIT_CONFIG_VALUE_0, 'input');
  assert.equal(settings.GIT_CONFIG_KEY_1, 'http.schannelUseSSLCAInfo');
  assert.equal(settings.GIT_CONFIG_VALUE_1, 'true');
  assert.equal(settings.GIT_CONFIG_KEY_2, 'http.sslVerify');
  assert.equal(settings.GIT_CONFIG_VALUE_2, 'true');
  assert.equal(settings.GIT_SSL_CAPATH, '/empty');
  assert.equal(Object.hasOwn(settings, 'GIT_SSL_NO_VERIFY'), false);
  assert.equal(settings.NODE_TLS_REJECT_UNAUTHORIZED, '1');
  assert.equal(settings.NPM_CONFIG_STRICT_SSL, 'true');
  assert.equal(settings.npm_config_strict_ssl, 'true');
  const publication = publicationGitEnvironment({ ...settings, GH_TOKEN: 'fixture-only', GITHUB_SERVER_URL: 'https://fixture.example',
    GIT_SSL_NO_VERIFY: 'false', git_ssl_no_verify: '1' });
  for (const [key, value] of Object.entries(settings)) if (key !== 'GIT_CONFIG_COUNT') assert.equal(publication[key], value);
  assert.equal(publication.GIT_CONFIG_COUNT, '4');
  assert.equal(publication.GIT_CONFIG_KEY_3, 'http.https://fixture.example/.extraheader');
  assert.equal(publication.GIT_CONFIG_VALUE_3, 'AUTHORIZATION: basic ' + Buffer.from('x-access-token:fixture-only').toString('base64'));
  assert.equal(Object.keys(publication).some(key => key.toUpperCase() === 'GIT_SSL_NO_VERIFY'), false);
  for (const value of ['-1', 'NaN', '1.5', '9007199254740991']) {
    assert.throws(() => trustSettings('ca', 'empty', { GIT_CONFIG_COUNT: value }));
    assert.throws(() => publicationGitEnvironment({ GIT_CONFIG_COUNT: value }));
  }
});

it('exports safe workflow settings without forbidden NODE_OPTIONS or environment injection', async t => {
  const root = await temporary(t), filename = path.join(root, 'env');
  exportSettings(trustSettings('/filtered.pem', '/empty'), filename);
  const text = await readFile(filename, 'utf8');
  assert.doesNotMatch(text, /NODE_OPTIONS/);
  assert.match(text, /GIT_SSL_CAINFO=\/filtered.pem/);
  assert.throws(() => exportSettings({ NODE_OPTIONS: '--use-openssl-ca' }, filename));
  assert.throws(() => exportSettings({ SSL_CERT_FILE: 'bad\nINJECTED=1' }, filename));
});

it('installs current npm before the exact Groma pin using native npm with explicit strict TLS', () => {
  const calls = [], settings = trustSettings('/private filtered.pem', '/empty');
  installGroma('0.7.4', settings, { env: { HTTPS_PROXY: 'http://proxy.example', NPM_TOKEN: 'preserved', GIT_SSL_NO_VERIFY: 'false', git_ssl_no_verify: '1' },
    execute: (args, env) => { calls.push(args); assert.equal(env.HTTPS_PROXY, 'http://proxy.example');
      assert.equal(env.NPM_TOKEN, 'preserved'); assert.equal(env.NODE_OPTIONS, '--use-openssl-ca');
      assert.equal(Object.keys(env).some(key => key.toUpperCase() === 'GIT_SSL_NO_VERIFY'), false); } });
  assert.deepEqual(calls, [installArguments('npm@12.2.0', settings.SSL_CERT_FILE), installArguments('groma.md@0.7.4', settings.SSL_CERT_FILE)]);
  for (const args of calls) { assert.ok(args.includes('--strict-ssl=true')); assert.ok(args.includes('--cafile=/private filtered.pem')); }
  assert.throws(() => installArguments('groma.md@0.7.4;echo unsafe', 'ca'));
  const executions = [];
  runNpm(calls[1], {}, { query: () => '/native/global modules', exists: () => true,
    execute: (...args) => executions.push(args) });
  assert.equal(executions[0][0], process.execPath);
  assert.equal(executions[0][1][0], path.join('/native/global modules', 'npm/bin/npm-cli.js'));
  assert.equal(executions[0][2].shell, undefined);
  runNpm(calls[1], {}, { query: () => '/custom/empty-prefix',
    exists: candidate => candidate === path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    execute: (...args) => executions.push(args) });
  assert.ok(executions[1][1][0].endsWith(path.join('npm', 'bin', 'npm-cli.js')));
});

it('the filtered bundle accepts a private loopback registry and rejects both compromised authentication paths', async t => {
  const ca = filterAuthorities([...incidents.map(c => c.pem), privateCA]);
  const key = await readFile(path.join(fixture, 'registry-server-key.pem'));
  for (const filename of ['registry-server.pem', 'incident-server-emudhra.pem', 'incident-server-aaa.pem']) {
    const server = https.createServer({ key, cert: await readFile(path.join(fixture, filename)) }, (_req, res) => res.end('ok'));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const response = new Promise((resolve, reject) => {
        https.get({ hostname: '127.0.0.1', servername: 'localhost', port: server.address().port, ca }, res => {
          res.resume(); res.on('end', () => resolve(res.statusCode));
        }).on('error', reject);
      });
      if (filename === 'registry-server.pem') assert.equal(await response, 200);
      else await assert.rejects(response, /certificate|issuer|revoked/i);
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  }
});

it('all four workflow entry points embed the exact offline bootstrap before network steps', async () => {
  const source = (await readFile(new URL('../trust-bootstrap.cjs', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
  const expected = source.slice(0, source.indexOf('module.exports =')) + 'exportSettings(prepareTrust(), process.env.GITHUB_ENV);\n';
  for (const filename of ['.github/workflows/check.yml', '.github/workflows/groma-demo.yml', 'examples/pages.yml', 'examples/pull-request.yml']) {
    const content = (await readFile(new URL('../' + filename, import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
    const inline = content.match(/          node <<'NODE'\n([\s\S]+?)          NODE\n/)[1].split('\n').map(line => line.slice(10)).join('\n');
    assert.equal(inline.trim(), expected.trim(), filename);
    assert.match(content, /NODE_OPTIONS: --use-openssl-ca/);
    assert.ok(content.indexOf('- &prepare-trust') < content.indexOf('uses:'));
  }
  const check = (await readFile(new URL('../.github/workflows/check.yml', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
  assert.match(check, /release:\n    types: \[published\]/);
  assert.equal((check.match(/ref: \$\{\{ github\.sha \}\}/g) ?? []).length, 2);
  const tagJob = check.split('\n  release-tag:\n')[1];
  assert.match(tagJob, /needs: \[check, release-smoke\]/);
  assert.match(tagJob, /!github.event.release.draft && !github.event.release.prerelease/);
  assert.match(tagJob, /contents: write/);
  assert.equal((check.match(/contents: write/g) ?? []).length, 1);
  assert.match(tagJob, /cancel-in-progress: false/);
  assert.match(tagJob, /object.sha !== process.env.GITHUB_SHA/);
  assert.match(tagJob, /latest.id !== release.id/);
  const allowedTag = new RegExp(tagJob.match(/!\/(.+)\/\.test\(release\.tag_name\)/)[1]);
  for (const tag of ['v1.0.0', 'v1.2.2', 'v1.20.10']) assert.ok(allowedTag.test(tag));
  for (const tag of ['v2.0.0', 'v1.02.2', 'v1.2.2-rc.1', 'v1.2.2/unsafe']) assert.equal(allowedTag.test(tag), false);
  assert.match(tagJob, /api\('git\/refs\/tags\/v1', 'PATCH', \{ sha: object.sha, force: false \}\)/);
  assert.match(tagJob, /ref: 'refs\/tags\/v1'/);
  assert.doesNotMatch(tagJob, /force: true/);
});


it('native Git reaches the private-CA mock 404 and sends no HTTP request through either compromised chain', async t => {
  const root = await temporary(t), cafile = path.join(root, 'filtered.pem'), empty = path.join(root, 'empty');
  await writeFile(cafile, filterAuthorities([...incidents.map(c => c.pem), privateCA]));
  const { mkdir } = await import('node:fs/promises');
  await mkdir(empty);
  const key = await readFile(path.join(fixture, 'registry-server-key.pem'));
  const clean = Object.fromEntries(Object.entries(process.env).filter(([name]) =>
    !/^(?:git_config(?:_.+)?|git_ssl_no_verify|https?_proxy|all_proxy|no_proxy)$/i.test(name)));
  // Isolated tests suppress only Schannel's online revocation lookup for these synthetic leaves.
  // Production revocation policy is unchanged. NOSYSTEM hides Git for Windows' backend selection.
  const platform = process.platform === 'win32'
    ? ['-c', 'http.sslBackend=schannel', '-c', 'http.schannelCheckRevoke=false'] : [];
  for (const { filename, suffix } of ['registry-server.pem', 'incident-server-emudhra.pem', 'incident-server-aaa.pem']
    .flatMap(filename => ['', '.git'].map(suffix => ({ filename, suffix })))) {
    let requests = 0;
    let authorization;
    const server = https.createServer({ key, cert: await readFile(path.join(fixture, filename)) }, (req, res) => {
      authorization = req.headers.authorization;
      requests++; res.writeHead(404); res.end('mock repository not found');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const remote = `https://localhost:${server.address().port}/owner/fixture${suffix}`;
      const inherited = { ...clean,
        GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: `http.${remote}.sslVerify`, GIT_CONFIG_VALUE_0: 'false',
        GITHUB_SERVER_URL: `https://localhost:${server.address().port}`, GITHUB_REPOSITORY: 'owner/fixture',
        GH_TOKEN: 'fixture-only', GIT_SSL_NO_VERIFY: 'false' };
      const env = publicationGitEnvironment({ ...inherited, ...trustSettings(cafile, empty, inherited),
        GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(root, 'no-global-config'),
        NO_PROXY: '127.0.0.1,localhost', GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never',
        GIT_TRACE_CURL: '1', GIT_TRACE_CURL_NO_DATA: '1' });
      const result = await promisify(execFile)('git', [...platform, 'ls-remote', remote],
        { env, timeout: 10000 }).then(() => null, error => error);
      const diagnostic = `${filename}${suffix || ' (no suffix)'}: code=${result?.code}, signal=${result?.signal}, killed=${result?.killed}, requests=${requests}\n${result?.stderr || ''}`;
      assert.ok(Number.isInteger(result?.code) && result.code !== 0 && !result.killed,
        'The mock 404 or certificate rejection must stop Git. ' + diagnostic);
      if (filename === 'registry-server.pem') {
        assert.ok(requests > 0, 'The private CA must reach the HTTP mock: ' + result.stderr);
        assert.match(result.stderr, /not found|404/i);
        assert.equal(authorization, 'basic ' + Buffer.from('x-access-token:fixture-only').toString('base64'));
      } else {
        assert.equal(requests, 0, `${filename} must fail before any HTTP request`);
        assert.match(result.stderr, /certificate|SSL|issuer|trust|schannel|revok/i);
      }
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  }
});
