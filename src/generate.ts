import type { DocsGenerateOptions, DocsGenerateResults } from './types';
import { parse } from './parse';
import { outputJson, outputReadme } from './output';

/**
 * Given the input files, will return generated results and optionally
 * write the data as a json file, readme, or both.
 */
export async function generate(opts: DocsGenerateOptions) {
  const results: DocsGenerateResults = {
    ...opts,
    data: await parse(opts),
  };

  if (opts.outputJsonPath) {
    await outputJson(opts.outputJsonPath, results.data);
  }

  if (opts.outputReadmePath) {
    await outputReadme(opts.outputReadmePath, results.data);
  }

  return results;
}
