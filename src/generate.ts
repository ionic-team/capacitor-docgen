import type { DocsGenerateOptions, DocsGenerateResults } from './types';
import { parse } from './parse';
import { outputJson, outputReadme } from './output';

/**
 * Given a tsconfig file path, or input files, will return generated
 * results and optionally write the data as a json file, readme, or both.
 */
export async function generate(opts: DocsGenerateOptions) {
  const apiFinder = parse(opts);

  const data = apiFinder(opts.api);

  const results: DocsGenerateResults = {
    ...opts,
    data,
  };

  if (opts.outputJsonPath) {
    await outputJson(opts.outputJsonPath, data);
  }

  if (opts.outputReadmePath) {
    await outputReadme(opts.outputReadmePath, data);
  }

  return results;
}
