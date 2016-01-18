Package.describe({
  summary: "Reaction Inventory",
  name: "reactioncommerce:reaction-inventory",
  version: "0.2.2",
  documentation: "README.md"
});


Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");

  // meteor base packages
  api.use("meteor-base");
  api.use("mongo");
  api.use("session");
  api.use("tracker");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("check");
  api.use("ecmascript");
  api.use("ddp-rate-limiter");
  api.use("blaze-html-templates");
  api.use("reactioncommerce:core@0.11.0");
  api.use("ongoworks:bunyan-logger@2.5.0");

  api.addFiles("common/globals.js"); // Inventory Globals
  api.addFiles("common/schema.js"); // ReactionCore.Schemas.Inventory
  api.addFiles("common/collections.js"); // Inventory collection
  api.addFiles("common/hooks.js"); // hook into core collection updates
  api.addFiles("common/methods.js"); // inventory methods

  api.addFiles("server/logger.js", ["server"]); // configure bunyan-logger
  api.addFiles("server/register.js", ["server"]); // register as a reaction package
  api.addFiles("server/publications.js", ["server"]); // publish inventory
  api.addFiles("server/methods.js", ["server"]); // server methods

  // api.addFiles("client/templates/dashboard/inventory.js", "client");
  // api.addFiles("client/templates/dashboard/inventory.html", "client");

  api.addFiles("client/templates/settings/settings.js", "client");
  api.addFiles("client/templates/settings/settings.html", "client");

  // export for server use
  api.export("ReactionInventory", "server");
});

Package.onTest(function (api) {
  api.use("sanjo:jasmine@0.20.3");
  api.use("ecmascript");
  api.use("jquery");
  api.use("underscore");
  api.use("velocity:html-reporter@0.9.1");
  api.use("velocity:console-reporter@0.1.4");

  api.use("reactioncommerce:core@0.11.0");
  api.use("reactioncommerce:reaction-factories");
  api.use("reactioncommerce:reaction-inventory");

  api.addFiles("tests/jasmine/server/integration/inventorySpecs.js", "server");
});
