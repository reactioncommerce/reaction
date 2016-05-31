Package.describe({
  summary: "Reaction Catalog",
  name: "reactioncommerce:reaction-catalog",
  version: "0.2.3",
  git: "https://github.com/reactioncommerce/reaction-catalog.git"
});

Npm.depends({
  "@sanjo/jasmine-spy": "1.0.1",
  "@sanjo/jasmine-expect": "1.0.0"
});


Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.3");

  // meteor base packages
  // TODO: @Aaron, please, check this deps list.
  api.use("meteor-base");
  api.use("mongo");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("check");
  api.use("ecmascript");
  api.use("reactioncommerce:core@0.13.0");

  api.addFiles("common/helpers.js"); // product common helpers
  api.addFiles("common/methods.js"); // product common Validated Methods

  api.addFiles("server/methods.js", ["server"]); // products server methods
  api.addFiles("server/register.js", ["server"]); // register as a reaction package

  api.export("ReactionProductAPI");
});

Package.onTest(function (api) {
  api.use("random");
  api.use("underscore");

  api.use("reactioncommerce:reaction-collections@2.2.1");
  api.use("reactioncommerce:reaction-factories@0.4.2");
  api.use("reactioncommerce:core@0.13.0");
  api.use("reactioncommerce:reaction-catalog");

  api.addFiles("server/products.app-test.js", "server");
});
