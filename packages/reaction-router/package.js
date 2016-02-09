Package.describe({
  summary: "Router for Reaction Commerce",
  name: "reactioncommerce:reaction-router",
  version: "1.0.0",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");
  api.use("ecmascript");
  api.use("session");
  api.use("tracker");
  api.use("blaze-html-templates");
  api.use("accounts-base");
  api.use("reactioncommerce:reaction-collections@1.0.5");
  // flow-router packages
  api.use("kadira:flow-router@2.10.0");
  api.use("kadira:blaze-layout@2.3.0");
  api.use("kadira:dochead@1.4.0");
  // helpers
  api.addFiles("client/helpers.js", "client");
  // routes
  api.addFiles("routes/layout.js");
  api.addFiles("routes/init.js");
  api.addFiles("routes/shop.js");
  api.addFiles("routes/products.js");
  api.addFiles("routes/tags.js");
  api.addFiles("routes/cart.js");
  api.addFiles("routes/dashboard.js");
  api.addFiles("routes/orders.js");


  api.addFiles("routes/accounts.js");
  // exports
  api.imply("kadira:dochead");
  // export router and subscription manager
  api.export("ReactionRouter");
});
