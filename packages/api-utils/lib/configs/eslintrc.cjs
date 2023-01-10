module.exports = {
  extends: "@reactioncommerce",
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      impliedStrict: true
    }
  },
  plugins: ["@babel/plugin-syntax-import-assertions"],
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
  }
};
