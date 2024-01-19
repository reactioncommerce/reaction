/* eslint-disable max-len */
// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

// Any packages that are published only as ESM need to be listed here
const externalNodeModules = [
  "@reactioncommerce/api-core",
  "@reactioncommerce/api-plugin-accounts",
  "@reactioncommerce/api-plugin-address-validation-test",
  "@reactioncommerce/api-plugin-address-validation",
  "@reactioncommerce/api-plugin-authentication",
  "@reactioncommerce/api-plugin-authorization-simple",
  "@reactioncommerce/api-plugin-carts",
  "@reactioncommerce/api-plugin-catalogs",
  "@reactioncommerce/api-plugin-discounts-codes",
  "@reactioncommerce/api-plugin-discounts",
  "@reactioncommerce/api-plugin-email-smtp",
  "@reactioncommerce/api-plugin-email-templates",
  "@reactioncommerce/api-plugin-email",
  "@reactioncommerce/api-plugin-i18n",
  "@reactioncommerce/api-plugin-inventory-simple",
  "@reactioncommerce/api-plugin-inventory",
  "@reactioncommerce/api-plugin-job-queue",
  "@reactioncommerce/api-plugin-navigation",
  "@reactioncommerce/api-plugin-notifications",
  "@reactioncommerce/api-plugin-orders",
  "@reactioncommerce/api-plugin-payments-example",
  "@reactioncommerce/api-plugin-payments-stripe-sca",
  "@reactioncommerce/api-plugin-payments",
  "@reactioncommerce/api-plugin-pricing-simple",
  "@reactioncommerce/api-plugin-products",
  "@reactioncommerce/api-plugin-settings",
  "@reactioncommerce/api-plugin-fulfillment",
  "@reactioncommerce/api-plugin-fulfillment-type-shipping",
  "@reactioncommerce/api-plugin-fulfillment-type-pickup",
  "@reactioncommerce/api-plugin-fulfillment-method-shipping-flat-rate",
  "@reactioncommerce/api-plugin-fulfillment-method-shipping-dynamic-rate",
  "@reactioncommerce/api-plugin-fulfillment-method-pickup-store",
  "@reactioncommerce/api-plugin-shops",
  "@reactioncommerce/api-plugin-simple-schema",
  "@reactioncommerce/api-plugin-sitemap-generator",
  "@reactioncommerce/api-plugin-surcharges",
  "@reactioncommerce/api-plugin-system-information",
  "@reactioncommerce/api-plugin-tags",
  "@reactioncommerce/api-plugin-taxes-flat-rate",
  "@reactioncommerce/api-plugin-taxes",
  "@reactioncommerce/api-plugin-translations",
  "@reactioncommerce/api-utils",
  "@reactioncommerce/db-version-check"
];

const jestConfig = {
  // All imported modules in your tests should be mocked automatically
  // automock: false,

  // Stop running tests after `n` failures
  // bail: 0,

  // Respect "browser" field in package.json when resolving modules
  // browser: false,

  // The directory where Jest should store its cached dependency information
  // cacheDirectory: "/private/var/folders/6t/9gklckns55q55y2w1vzjv2qh0000gn/T/jest_dx",

  // Automatically clear mock calls and instances between every test
  // clearMocks: false,

  // Indicates whether the coverage information should be collected while executing the test
  // collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: null,

  // The directory where Jest should output its coverage files
  // coverageDirectory: null,

  // An array of regexp pattern strings used to skip coverage collection
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // A list of reporter names that Jest uses when writing coverage reports
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],

  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: null,

  // A path to a custom dependency extractor
  // dependencyExtractor: null,

  // Make calling deprecated APIs throw helpful error messages
  // errorOnDeprecated: false,

  // Force coverage collection from ignored files using an array of glob patterns
  // forceCoverageMatch: [],

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: null,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: null,

  // A set of global variables that need to be available in all test environments
  // globals: {},

  // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
  // maxWorkers: "50%",

  // An array of directory names to be searched recursively up from the requiring module's location
  // moduleDirectories: [
  //   "node_modules"
  // ],

  // An array of file extensions your modules use
  // moduleFileExtensions: [
  //   "js",
  //   "json",
  //   "jsx",
  //   "ts",
  //   "tsx",
  //   "node"
  // ],

  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "^/tests/(.*)$": "<rootDir>/tests/$1",
    "^@reactioncommerce/api-utils/(.*)$": "@reactioncommerce/api-utils/lib/$1"
  },

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
  // modulePathIgnorePatterns: [],

  // Activates notifications for test results
  // notify: false,

  // An enum that specifies notification mode. Requires { notify: true }
  // notifyMode: "failure-change",

  // A preset that is used as a base for Jest's configuration
  // preset: null,

  // Run tests from one or more projects
  // projects: null,

  // Use this configuration option to add custom reporters to Jest
  // reporters: undefined,

  // Automatically reset mock state between every test
  // resetMocks: false,

  // Reset the module registry before running each individual test
  // resetModules: false,

  // A path to a custom resolver
  // resolver: null,

  // Automatically restore mock state between every test
  // restoreMocks: false,

  // The root directory that Jest should scan for tests and modules within
  // rootDir: null,

  // A list of paths to directories that Jest should use to search for files in
  // roots: [
  //   "<rootDir>"
  // ],

  // Allows you to use a custom runner instead of Jest's default test runner
  // runner: "jest-runner",

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/tests/util/setupJestTests.js"],

  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  // snapshotSerializers: [],

  // The test environment that will be used for testing
  testEnvironment: "node",

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},

  // Adds a location field to test results
  // testLocationInResults: false,

  // The glob patterns Jest uses to detect test files
  // testMatch: [
  //   "**/__tests__/**/*.[jt]s?(x)",
  //   "**/?(*.)+(spec|test).[tj]s?(x)"
  // ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  // testPathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // The regexp pattern or array of patterns that Jest uses to detect test files
  // testRegex: [],

  // This option allows the use of a custom results processor
  // testResultsProcessor: null,

  // This option allows use of a custom test runner
  testRunner: "jasmine2",

  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },

  // This option sets the URL for the jsdom environment. It is reflected in properties such as location.href
  // testURL: "http://localhost",

  // Setting this value to "fake" allows the use of fake timers for functions such as "setTimeout"
  // timers: "real",

  // A map from regular expressions to paths to transformers
  // transform: {},

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    // Any packages that are published only as ESM need to be listed here
    `node_modules/(?!(${externalNodeModules.join("|")})/)`
  ]

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
  // unmockedModulePathPatterns: undefined,

  // Indicates whether each individual test should be reported during the run
  // verbose: null,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  // watchPathIgnorePatterns: [],

  // Whether to use watchman for file crawling
  // watchman: true,
};

module.exports = jestConfig;
