Package.describe({
  summary: "Reaction Commerce i18n utilities",
  name: "reactioncommerce:reaction-i18n",
  version: "2.0.2",
  documentation: "README.md"
});

Npm.depends({
  "i18next": "2.2.0",
  "i18next-sprintf-postprocessor": "0.0.6",
  "i18next-browser-languagedetector": "0.0.14",
  "i18next-localstorage-cache": "0.0.4",
  "jquery-i18next": "0.0.14"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");

  // meteor base packages
  api.use("meteor-base");
  api.use("mongo");
  api.use("ecmascript");
  api.use("es5-shim");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("jquery");
  api.use("tracker");

  // meteor add-on packages
  api.use("logging");
  api.use("reload");
  api.use("check");
  api.use("http");
  api.use("reactive-var");
  api.use("reactive-dict");

  // reaction packages
  api.use("reactioncommerce:reaction-collections@2.0.1");
  api.use("reactioncommerce:core@0.12.0");
  // temp until Meteor 1.3 and we switch to modules
  api.use("cosmos:browserify@0.10.0", "client");

  // server
  api.addFiles("server/import.js", "server");
  api.addFiles("server/i18next.js", "server");
  api.addFiles("server/methods.js", "server");

  // export client i18next
  api.addFiles("client/i18next.browserify.js", "client");

  // register reaction package
  api.addFiles("server/register.js", "server");

  // client helpers
  api.addFiles("client/helpers/i18n.js", "client");
  api.addFiles("client/helpers/helpers.js", "client");

  // i18nchooser
  api.addFiles("client/templates/header/i18n.html", "client");
  api.addFiles("client/templates/header/i18n.js", "client");

  // settings
  api.addFiles("client/templates/i18nSettings.html", "client");
  api.addFiles("client/templates/i18nSettings.js", "client");

  // i18n translations
  api.addAssets("private/data/i18n/ar.json", "server");
  api.addAssets("private/data/i18n/bg.json", "server");
  api.addAssets("private/data/i18n/cn.json", "server");
  api.addAssets("private/data/i18n/cs.json", "server");
  api.addAssets("private/data/i18n/de.json", "server");
  api.addAssets("private/data/i18n/en.json", "server");
  api.addAssets("private/data/i18n/el.json", "server");
  api.addAssets("private/data/i18n/es.json", "server");
  api.addAssets("private/data/i18n/fr.json", "server");
  api.addAssets("private/data/i18n/he.json", "server");
  api.addAssets("private/data/i18n/hr.json", "server");
  api.addAssets("private/data/i18n/hu.json", "server");
  api.addAssets("private/data/i18n/it.json", "server");
  api.addAssets("private/data/i18n/my.json", "server");
  api.addAssets("private/data/i18n/nl.json", "server");
  api.addAssets("private/data/i18n/pl.json", "server");
  api.addAssets("private/data/i18n/pt.json", "server");
  api.addAssets("private/data/i18n/ru.json", "server");
  api.addAssets("private/data/i18n/sl.json", "server");
  api.addAssets("private/data/i18n/sv.json", "server");
  api.addAssets("private/data/i18n/tr.json", "server");
  api.addAssets("private/data/i18n/vi.json", "server");
  api.addAssets("private/data/i18n/nb.json", "server");
  // exports
  api.imply("jquery");
  api.export("i18next");
  api.export("i18nextSprintfPostProcessor");
  api.export("i18nextJquery");
  api.export("i18nextBrowserLanguageDetector");
  api.export("i18nextLocalStorageCache");
});

Package.onTest(function (api) {
  api.use("meteor-base");
  api.use("underscore");
  api.use("ecmascript");
  api.use("random");
  api.use("sanjo:jasmine@0.21.0");
  api.use("velocity:html-reporter@0.9.1");
  api.use("velocity:console-reporter@0.1.4");

  // reaction core
  api.use("reactioncommerce:reaction-i18n@2.0.0");
  api.use("reactioncommerce:reaction-collections@2.0.1");
  api.use("reactioncommerce:reaction-factories@0.4.2");
  api.use("reactioncommerce:core@0.12.0");

  // server integration tests
  api.addFiles("tests/jasmine/server/integration/methods.js", "server");
});
