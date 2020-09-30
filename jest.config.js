module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'jsx', 'json', 'd.ts'],
  testPathIgnorePatterns: ['/.vscode', '/dist', '/node_modules'],
  testRegex: '(/__tests__/.*|\\.?(test|spec))\\.(ts)$',
  transform: {
    '^.+\\.(ts)$': '@stencil/core/testing/jest-preprocessor.js',
  },
  watchPathIgnorePatterns: ['^.+\\.d\\.ts$'],
};
