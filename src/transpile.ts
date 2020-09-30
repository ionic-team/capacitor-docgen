import ts from 'typescript';
import fs from 'fs';
import path from 'path';

export function getTsProgram(tsconfigPath: string) {
  const configResult = ts.readConfigFile(tsconfigPath, p =>
    fs.readFileSync(p, 'utf-8'),
  );

  if (configResult.error) {
    throw new Error(
      `Unable to read tsconfig path: "${tsconfigPath}". ` +
        ts.flattenDiagnosticMessageText(configResult.error.messageText, '\n'),
    );
  }
  const tsconfigDir = path.dirname(tsconfigPath);
  const rootNames = configResult.config.files.map((f: string) => {
    return path.join(tsconfigDir, f);
  });
  const options = configResult.config.compilerOptions;

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
