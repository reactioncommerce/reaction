/**
 * Babel is used only for running Jest tests in API projects.
 * If Jest adds support for ESM and import.meta, then Babel
 * may become unnecessary.
 */

module.exports = function (api) { // eslint-disable-line no-undef
  api.cache(false);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "18"
          }
        }
      ]
    ],
    plugins: [
      "babel-plugin-transform-import-meta",
      "@babel/plugin-syntax-import-assertions",
      "module:@reactioncommerce/babel-remove-es-create-require",
      "rewire-exports",
      "transform-es2015-modules-commonjs"
    ]
  };
};
