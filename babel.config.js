const fs = require("fs");

/**
 * @summary Babel 7 doesn't transpile files in sub-directories that have a package.json when Babel is configured
 * through package.json or .babelrc. This causes Jest test failures in custom plugins that have a package.json. It
 * isn't an issue with non-test files because those are imported through the main Reaction app (see /server/plugins.js
 * and client/plugins.js). Babel does transpile these files when it is configured through the new babel.config.js.
 * Meteor currently only loads Babel config through .babelrc or package.json. So, in order to support Babel transpiling
 * of Jest tests, we load the babel config defined in package.json and export it here.
 * See this Github comment: https://github.com/facebook/jest/issues/6053#issuecomment-383632515
 * @param {Object} api api data object
 * @returns {Object} babel formatted package.json
 */
module.exports = function (api) {
  api.cache(false);

  /**
   * Meteor only reads the babel config from .babelrc or package.json. So with just babel.config.js,
   * the Meteor app fails but the Jest tests pass. With just package.json, the Jest tests in custom plugins
   * fail but the app runs.
   */
  const file = fs.readFileSync("./package.json");
  const packageJSON = JSON.parse(file);

  return packageJSON.babel;
};
