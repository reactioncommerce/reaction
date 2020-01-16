/* eslint-disable no-undef */

// This must not be an ES module because we want
// this check to work on older Node versions that
// do not support ES modules.

const semver = require("semver");
const packageJson = require("../package.json");

const requiredNodeVersion = packageJson.engines.node;
if (!semver.satisfies(process.version, requiredNodeVersion)) {
  throw new Error(`Required node version ${requiredNodeVersion} not satisfied with current version ${process.version}.` +
    " Did you forget to run 'nvm use'?");
}
