import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const [previousMap, comparison] = process.argv.slice(2).map(directory => path.resolve(directory));
const incoming = path.join(comparison, 'architecture/auto');
const { from, revision } = JSON.parse(await readFile(path.join(incoming, 'comparison.json'), 'utf8'));
const publisher = fileURLToPath(new URL('../publish/publish.mjs', import.meta.url));
const root = await mkdtemp(path.join(os.tmpdir(), 'groma-publication-'));
const seed = path.join(root, 'seed');
const remote = path.join(root, 'pages.git');
const outputs = path.join(root, 'outputs');
const repository = 'fixture/project';
const preview = 'comparison/pr-42/auto/';
const gitEnv = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_ALLOW_PROTOCOL: 'file' };
const exec = promisify(execFile);
const git = (args, cwd = root) => exec('git', args, { cwd, env: gitEnv });
const api = `/repos/${repository}`;
const responses = {
  [api]: { private: false },
  [`${api}/pages`]: { build_type: 'workflow', public: true },
  [`${api}/pulls/42`]: { base: { sha: from }, head: { sha: revision } },
  [`${api}/issues/42/comments`]: [],
};

let site;
let comment;
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (request.method === 'POST' && pathname === `${api}/issues/42/comments`) {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      comment = JSON.parse(Buffer.concat(chunks).toString()).body;
    }
    if (Object.hasOwn(responses, pathname)) return response.end(JSON.stringify(responses[pathname]));
    if (pathname === `/${preview}`) return response.end(await readFile(path.join(site, preview, 'index.html')));
    response.writeHead(404).end();
  } catch (error) {
    response.writeHead(500).end(String(error));
  }
});

try {
  await cp(previousMap, seed, { recursive: true });
  const lastGoodMap = await readFile(path.join(seed, 'architecture/auto/index.html'));
  await writeFile(path.join(seed, '.groma-previews'), 'Groma PR previews\n');
  await writeFile(path.join(seed, '.nojekyll'), '');
  await git(['init', '--bare', remote]);
  await git(['init', '-b', 'groma-previews'], seed);
  await git(['add', '.'], seed);
  await git(['-c', 'user.name=Groma fixture', '-c', 'user.email=fixture@example.com', 'commit', '-m', 'Last good map'], seed);
  await git(['push', pathToFileURL(remote).href, 'HEAD:refs/heads/groma-previews'], seed);

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const publish = command => exec(process.execPath, [publisher, command], { cwd: root, env: {
    ...gitEnv, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: `url.${pathToFileURL(remote).href}.insteadOf`,
    GIT_CONFIG_VALUE_0: `https://github.com/${repository}.git`, RUNNER_TEMP: root, GITHUB_OUTPUT: outputs,
    GITHUB_SERVER_URL: 'https://github.com', GITHUB_REPOSITORY: repository, GITHUB_API_URL: url, GH_TOKEN: 'fixture',
    GROMA_DIRECTORY: comparison, GROMA_THEME: 'auto', GROMA_PREVIEW_LAYOUT: 'comparison', GROMA_PULL_REQUEST: '42',
    GROMA_BASE: from, GROMA_PAGE_URL: url,
  } });

  await publish('store');
  const result = await readFile(outputs, 'utf8');
  assert.ok(result.includes('ready=true\n'));
  site = /^site=(.+)$/m.exec(result)?.[1];
  assert.ok(site);
  assert.deepEqual(await readFile(path.join(site, 'architecture/auto/index.html')), lastGoodMap);
  const { stdout } = await git([`--git-dir=${remote}`, 'diff', '--name-only', 'groma-previews^', 'groma-previews']);
  const changed = stdout.trim().split('\n');
  assert.ok(changed.includes(`${preview}index.html`));
  assert.ok(changed.every(filename => filename.startsWith(preview)));

  await publish('link');
  const previewUrl = `${url}/${preview}?revision=${revision}&from=${from}`;
  assert.ok(comment?.includes(previewUrl));
  const response = await fetch(previewUrl);
  assert.equal(response.status, 200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(path.join(incoming, 'index.html')));
  console.log('The publisher kept the previous map and served the new comparison at the URL in the PR comment.');
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await rm(root, { recursive: true, force: true });
}
