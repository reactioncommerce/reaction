Package.describe({
  summary: "Reaction Collections - core collections + hooks, cfs, jobs",
  name: "reactioncommerce:reaction-collections",
  documentation: "README.md",
  version: "2.0.1"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");
  api.use("random");
  api.use("underscore");
  api.use("ecmascript");
  api.use("check");
  api.use("tracker");
  api.use("session");
  api.use("ejson");

  api.use("amplify@1.0.0");
  api.use("reactioncommerce:reaction-schemas@2.0.3");
  api.use("cfs:standard-packages@0.5.9");
  api.use("cfs:storage-adapter@0.2.3");
  api.use("cfs:graphicsmagick@0.0.18");
  api.use("cfs:gridfs@0.0.33");
  api.use("cfs:filesystem@0.1.2");
  api.use("cfs:ui@0.1.3");
  api.use("raix:ui-dropped-event@0.0.7");
  api.use("vsivsi:job-collection@1.3.0");
  api.use("ongoworks:security@1.3.0");
  api.use("reactioncommerce:reaction-logger@0.1.0");
  api.use("alanning:roles@1.2.14");
  api.use("meteorhacks:subs-manager@1.6.3");
  api.use("alanning:roles@1.2.14");
  // ReactionCore declaration
  api.addFiles("common/globals.js");

  // collections
  api.addFiles("common/collections/collections.js");
  api.addFiles("common/collections/collectionFS.js");

  // collection hooks
  api.addFiles("common/collections/hooks/hooks.js");

  // publications
  api.addFiles("server/publications/accounts.js", "server");
  api.addFiles("server/publications/members.js", "server");
  api.addFiles("server/publications/sessions.js", "server");
  api.addFiles("server/publications/shops.js", "server");
  api.addFiles("server/publications/cart.js", "server");
  api.addFiles("server/publications/discounts.js", "server");
  api.addFiles("server/publications/taxes.js", "server");
  api.addFiles("server/publications/shipping.js", "server");
  api.addFiles("server/publications/media.js", "server");
  api.addFiles("server/publications/orders.js", "server");
  api.addFiles("server/publications/packages.js", "server");
  api.addFiles("server/publications/product.js", "server");
  api.addFiles("server/publications/products.js", "server");
  api.addFiles("server/publications/tags.js", "server");
  api.addFiles("server/publications/translations.js", "server");
  api.addFiles("server/publications/themes.js", "server");

  // security
  api.addFiles("server/logger.js", "server");
  api.addFiles("server/main.js", "server");
  api.addFiles("server/security.js", "server");

  // client subscriptions
  api.addFiles("client/subscriptions.js", "client");

  // imply to share
  api.imply("cfs:standard-packages");
  api.imply("cfs:storage-adapter");
  api.imply("cfs:graphicsmagick");
  api.imply("cfs:filesystem");
  api.imply("cfs:gridfs");
  api.imply("raix:ui-dropped-event");
  api.imply("vsivsi:job-collection");
  api.imply("ongoworks:security");
  api.imply("alanning:roles");
  api.imply("alanning:roles");
  api.imply("meteorhacks:subs-manager");
  api.imply("reactioncommerce:reaction-schemas");

  // ensure schemas vars are passed through
  api.export("ReactionCore");
  api.export("ReactionSubscriptions");
});

Package.onTest(function (api) {
  api.use("meteor-base");
  api.use("underscore");
  api.use("random");
  api.use("sanjo:jasmine@0.21.0");
  api.use("velocity:html-reporter@0.9.1");
  api.use("velocity:console-reporter@0.1.4");

  api.use("accounts-base");
  api.use("accounts-password");
  api.use("reactioncommerce:core");
  api.use("reactioncommerce:reaction-collections");
  api.use("reactioncommerce:reaction-factories@0.4.2");

  api.addFiles("tests/jasmine/server/integration/publications.js", "server");
});
