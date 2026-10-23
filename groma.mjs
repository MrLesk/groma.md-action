import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execute = promisify(execFile);

/** Start the npm launcher directly; Windows command wrappers are not executables. */
export function runGroma(args, options = {}) {
  const launcher = (options.env ?? process.env).GROMA_CLI;
  if (!launcher) throw new Error('Install Groma before running the Action.');
  return execute(process.execPath, [launcher, ...args], options);
}
