Package.describe({
  summary: "Reaction Schemas - core reaction commerce collection schemas",
  name: "reactioncommerce:reaction-schemas",
  version: "1.0.2",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");
  api.use("random");
  api.use("underscore");
  api.use("ecmascript");
  api.use("momentjs:moment@2.10.6");
  api.use("ongoworks:transliteration@0.1.1");
  api.use("aldeed:collection2@2.6.0");
  api.use("aldeed:simple-schema@1.5.0");
  api.use("matb33:collection-hooks@0.8.1");
  api.use("mikowals:batch-insert@1.1.13");


  // ReactionCore declaration
  api.addFiles("common/common.js");
  api.addFiles("common/globals.js");


  // schemas
  api.addFiles("common/schemas/address.js");
  api.addFiles("common/schemas/layouts.js");
  api.addFiles("common/schemas/packages.js");
  api.addFiles("common/schemas/shops.js");
  api.addFiles("common/schemas/payments.js");
  api.addFiles("common/schemas/shipping.js");
  api.addFiles("common/schemas/taxes.js");
  api.addFiles("common/schemas/discounts.js");
  api.addFiles("common/schemas/products.js");
  api.addFiles("common/schemas/tags.js");
  api.addFiles("common/schemas/cart.js");
  api.addFiles("common/schemas/orders.js");
  api.addFiles("common/schemas/translations.js");
  api.addFiles("common/schemas/templates.js");

  api.imply("matb33:collection-hooks");
  api.imply("aldeed:collection2");
  api.imply("aldeed:simple-schema");
  api.imply("ongoworks:transliteration");
  api.export("ReactionCore");
  api.export("getSlug");
});

Package.onTest(function (api) {
  api.use("underscore");
  api.use("random");
  api.use("sanjo:jasmine@0.20.2");
  api.use("velocity:html-reporter@0.9.1");
  api.use("velocity:console-reporter@0.1.4");

  // server integration tests
  // api.addFiles("tests/jasmine/server/integration/schemas.js", "server");
  api.export("getSlug");
});
