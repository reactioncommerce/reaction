/* eslint-disable */

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "^@reactioncommerce/api-utils/(.*)$": "@reactioncommerce/api-utils/lib/$1"
  },

  // The test environment that will be used for testing
  testEnvironment: "node",

  // Additional settings for the test environment
  logHeapUsage: true,
  workerIdleMemoryLimit: '1GB',

  testRunner: "jasmine2",

  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    // Any packages that are published only as ESM need to be listed here
    "node_modules/(?!(@reactioncommerce/api-utils)/)"
  ]
};
