import minimist from 'minimist';
import c from 'colorette';
import path from 'path';
import type { DocsGenerateOptions } from './types';
import { generate } from './generate';
import ts from 'typescript';
import fs from 'fs';

/**
 * Run command executed by the cli.
 */
export async function run(config: { cwd: string; args: string[] }) {
  const args = minimist(config.args, {
    string: ['project', 'api', 'output-json', 'output-readme'],
    boolean: ['silent'],
    alias: {
      p: 'project',
      a: 'api',
      j: 'output-json',
      r: 'output-readme',
      s: 'silent',
    },
  });

  try {
    if (!args.api) {
      throw new Error(
        `Please provide the primary interface name using the "--api" arg`,
      );
    }

    const tsconfigPath = getTsconfigPath(config.cwd, args.project);
    if (!tsconfigPath) {
      throw new Error(
        `Unable to find project's tsconfig.json file. Use the "--project" arg to specify the exact path.`,
      );
    }

    const opts: DocsGenerateOptions = {
      tsconfigPath,
      api: args.api,
    };

    if (!args['output-json'] && !args['output-readme']) {
      throw new Error(
        `Please provide an output path with either "--output-readme" or "--output-json" args, or both.`,
      );
    }

    if (args['output-json']) {
      opts.outputJsonPath = normalizePath(config.cwd, args['output-json']);
    }
    if (args['output-readme']) {
      opts.outputReadmePath = normalizePath(config.cwd, args['output-readme']);
    }

    const results = await generate(opts);

    if (!args.silent) {
      console.log('');
      logOutput(results.outputJsonPath);
      logOutput(results.outputReadmePath);
      console.log('');
    }
  } catch (e) {
    if (!args.silent) {
      console.error(c.red(`\n${emoji(`❌`)}DocGen ${e}\n`));
    }
    process.exit(1);
  }
}

function getTsconfigPath(cwd: string, cliTsConfigPath: string) {
  if (cliTsConfigPath) {
    return normalizePath(cwd, cliTsConfigPath);
  }
  return ts.findConfigFile(cwd, f => fs.existsSync(f));
}

function logOutput(outputPath: string | undefined) {
  if (outputPath) {
    console.log(c.green(`${emoji(`✔️`)}DocGen Output:`), outputPath);
  }
}

function normalizePath(cwd: string, p: string) {
  if (!path.isAbsolute(p)) {
    p = path.join(cwd, p);
  }
  return path.normalize(p);
}

function emoji(em: string) {
  if (process.platform !== 'win32') {
    return `${em} `;
  }
  return ``;
}
