import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { DocsParseOptions } from './types';

export function getTsProgram(opts: DocsParseOptions) {
  let rootNames: string[];
  let options: ts.CompilerOptions;

  if (typeof opts.tsconfigPath === 'string') {
    const configResult = ts.readConfigFile(opts.tsconfigPath, p =>
      fs.readFileSync(p, 'utf-8'),
    );

    if (configResult.error) {
      throw new Error(
        `Unable to read tsconfig path: "${opts.tsconfigPath}". ` +
          ts.flattenDiagnosticMessageText(configResult.error.messageText, '\n'),
      );
    }
    const tsconfigDir = path.dirname(opts.tsconfigPath);
    rootNames = (configResult.config.files ?? []).map((f: string) => {
      return path.join(tsconfigDir, f);
    });
    options = configResult.config.compilerOptions;
  } else if (Array.isArray(opts.inputFiles) && opts.inputFiles.length > 0) {
    opts.inputFiles.forEach(i => {
      if (!path.isAbsolute(i)) {
        throw new Error(`inputFile "${i}" must be absolute`);
      }
    });
    options = {};
    rootNames = [...opts.inputFiles];
  } else {
    throw new Error(
      `Either "tsconfigPath" or "inputFiles" option must be provided`,
    );
  }

  // same defaults as transpile() for faster parse-only transpiling
  options.isolatedModules = true;
  options.suppressOutputPathCheck = true;
  options.allowNonTsExtensions = true;
  options.removeComments = false;
  options.types = undefined;
  options.noEmit = undefined;
  options.noEmitOnError = undefined;
  options.noEmitHelpers = true;
  options.paths = undefined;
  options.rootDirs = undefined;
  options.declaration = undefined;
  options.composite = undefined;
  options.declarationDir = undefined;
  options.out = undefined;
  options.outFile = undefined;
  options.outDir = undefined;
  options.sourceMap = false;

  options.jsx = ts.JsxEmit.React;
  options.module = ts.ModuleKind.ESNext;
  options.target = ts.ScriptTarget.Latest;
  options.moduleResolution = ts.ModuleResolutionKind.NodeJs;

  return ts.createProgram({
    rootNames,
    options,
  });
}
