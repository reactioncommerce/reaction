Package.describe({
  summary: "Reaction Commerce Sample Data",
  name: "reactioncommerce:reaction-sample-data",
  version: "0.1.3",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.3");

  // reaction core
  api.use("reactioncommerce:core@0.13.0");

  // load fixture data
  api.addFiles("server/load.js", "server");

  // Private fixture data
  api.addAssets("private/data/Products.json", "server");
  api.addAssets("private/data/Shops.json", "server");
  api.addAssets("private/data/Tags.json", "server");
});
