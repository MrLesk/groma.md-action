import { execFile } from 'node:child_process';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

export function readPayload(html) {
  const json = html.match(/<script type="application\/json" id="world">([\s\S]*?)<\/script>/)?.[1];
  if (!json) throw new Error('Groma export does not contain its published world.');
  return JSON.parse(json);
}

export function summarize(payload) {
  if (!payload.comparison) throw new Error('Groma did not export a comparison.');
  const count = statuses => {
    const result = { added: 0, modified: 0, removed: 0 };
    for (const status of statuses) {
      if (status in result) result[status]++;
      else if (status !== 'unchanged') throw new Error(`Unknown Groma change status: ${status}`);
    }
    return result;
  };
  return {
    from: payload.comparison.from.id,
    revision: payload.revision.id,
    components: count(Object.values(payload.comparison.components).map(change => change.status)),
    relationships: count(Object.values(payload.comparison.relationships)),
  };
}

// Export reads committed Markdown and source. Disable optional scanner outline hooks:
// a PR must not load a repository-selected JavaScript module, even in a read-only job.
export async function exportComparison({ configFile, directory, from, revision, execute = run }) {
  const original = await readFile(configFile, 'utf8');
  const config = JSON.parse(original);
  try {
    await writeFile(configFile, JSON.stringify({ ...config, scanners: [] }));
    await execute('groma', ['export', directory, '--from', from, '--revision', revision]);
  } finally {
    await writeFile(configFile, original);
  }
  const payload = readPayload(await readFile(path.join(directory, 'index.html'), 'utf8'));
  const summary = summarize(payload);
  const filename = path.join(directory, 'comparison.json');
  await writeFile(filename, JSON.stringify(summary, null, 2) + '\n');
  return filename;
}

if (process.argv[1] === import.meta.filename) {
  const summary = await exportComparison({
    configFile: process.env.GROMA_CONFIG,
    directory: process.env.GROMA_EXPORT,
    from: process.env.GROMA_FROM,
    revision: process.env.GROMA_REVISION,
  });
  await appendFile(process.env.GITHUB_OUTPUT, `summary=${summary}\n`);
}
