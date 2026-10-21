import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import trust from './trust-bootstrap.cjs';
export const { blockedSPKI, filterAuthorities, npmAuthorities, trustSettings, prepareTrust, exportSettings } = trust;

export function installArguments(packageName, bundle) {
  if (!/^groma\.md@[0-9A-Za-z][0-9A-Za-z.+_-]*$/.test(packageName) && packageName !== 'npm@12.2.0') {
    throw new Error('Choose an exact Groma version or npm distribution tag.');
  }
  return ['install', '--global', '--strict-ssl=true', `--cafile=${bundle}`, packageName];
}

export function runNpm(args, env, { query = trust.nativeNpm, execute = execFileSync, exists = existsSync } = {}) {
  const root = query(['root', '--global'], { env });
  const candidates = [path.join(root, 'npm', 'bin', 'npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')];
  const cli = candidates.find(candidate => exists(candidate));
  if (!cli) throw new Error('Cannot locate the native npm CLI.');
  // npm retains its own authentication, proxy, registry and global config handling.
  execute(process.execPath, [cli, ...args], { env, stdio: 'inherit' });
}

export function installGroma(version, settings, { env = process.env, execute = runNpm } = {}) {
  const [major, minor, patch] = process.versions.node.split('.').map(Number);
  if (major < 26 || (major === 26 && (minor < 12 || (minor === 12 && patch < 1)))) {
    throw new Error('Groma installation requires patched Node 26.12.1 or newer.');
  }
  const args = installArguments(`groma.md@${version}`, settings.SSL_CERT_FILE);
  const strict = Object.fromEntries(Object.entries({ ...env, ...settings, NODE_OPTIONS: '--use-openssl-ca' })
    .filter(([key]) => key.toUpperCase() !== 'GIT_SSL_NO_VERIFY'));
  execute(installArguments('npm@12.2.0', settings.SSL_CERT_FILE), strict);
  execute(args, strict);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const settings = prepareTrust();
  exportSettings(settings, process.env.GITHUB_ENV);
  if (process.argv[2] === 'install') installGroma(process.env.GROMA_VERSION, settings);
  else if (process.argv[2]) throw new Error('Usage: prepare-trust.mjs [install]');
}
