Package.describe({
  summary: "Reaction Commerce i18n utilities",
  name: "reactioncommerce:reaction-i18n",
  version: "1.0.0",
  documentation: "README.md"
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
  api.use("underscore");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("check");
  api.use("http");
  api.use("reactive-var");
  api.use("reactive-dict");

  // community packages
  api.use("reactioncommerce:core@0.12.0");
  // client
  api.addFiles("client/helpers/i18n.js", "client");
  // server
  api.addFiles("server/import.js", "server");

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
});
