const jestConfig = require("@reactioncommerce/api-utils/lib/configs/jest.config.cjs");

/* eslint-disable max-len */
// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

// Any packages that are published only as ESM need to be listed here
const externalNodeModules = [
  "@reactioncommerce/api-utils",
  "@reactioncommerce/api-plugin-catalogs",
  "@reactioncommerce/api-plugin-shops"
];

jestConfig.transformIgnorePatterns = [
  // Any packages that are published only as ESM need to be listed here
  `node_modules/(?!(${externalNodeModules.join("|")})/)`
];

module.exports = jestConfig;
