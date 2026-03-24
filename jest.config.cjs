// The config file is in .cjs extension so that it can be loaded by
// Jest without any transpilation
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  // tells Jest to use ts-jest to transform *.ts files with and use the
  // tsconfig.test.json when parsing TS
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }]
  },
  // The app is authored for NodeNext/ESM, where TypeScript expects explicit file extensions
  // in relative imports. The IDE wants import {foo} from "./foo.js"
  // when moduleResolution is NodeNext.
  // But Jest setup is resolving modules in a more CommonJS-like way,
  // so when transformed test code tries to load:
  // import {foo} from "./foo.js"
  // Jest will look for an actual foo.js (which does not exist at dev-time)
  // so this tells Jest to remove that ".js" extension from import paths
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8"
}
