const { readFileSync } = require("fs"); // eslint-disable-line no-undef

const IMPORT_EXTENSIONS_AS_STRING = ["graphql"];

/**
 * @summary Handler to import a filename as a string
 * @param {Module} mod module
 * @param {String} filename File name
 * @return {undefined}
 */
function handleStringImport(mod, filename) {
  mod.exports = readFileSync(filename, "utf-8");
}

IMPORT_EXTENSIONS_AS_STRING.forEach((ext) => {
  require.extensions[`.${ext}`] = handleStringImport; // eslint-disable-line no-undef
});
