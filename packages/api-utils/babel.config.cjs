/**
 * Babel is used only for running Jest tests in API projects.
 * If Jest adds support for ESM and import.meta, then Babel
 * may become unnecessary.
 */

module.exports = require("./lib/configs/babel.config.cjs");
