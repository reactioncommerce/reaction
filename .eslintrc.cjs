module.exports = {
  root: true,
  extends: "@reactioncommerce",
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    babelOptions: {
      plugins: ["@babel/plugin-syntax-import-assertions"]
    },
    ecmaFeatures: {
      impliedStrict: true
    },
    requireConfigFile: false
  },
  env: {
    es6: true,
    jasmine: true
  },
  rules: {
    "node/no-missing-import": "off",
    "node/no-missing-require": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-unpublished-import": "off",
    "node/no-unpublished-require": "off"
  },
  ignorePatterns: ["node_modules"]
};
