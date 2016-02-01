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
  api.use("blaze-html-templates");
  api.use("reactioncommerce:reaction-collections@1.0.5");
  // Flow router packages
  api.use("kadira:flow-router@2.10.0");
  api.use("kadira:blaze-layout@2.3.0");

  api.addFiles("routes/router.js");
  api.addFiles("routes/shop.js");
  api.addFiles("routes/products.js");
  api.addFiles("routes/tags.js");
  api.addFiles("routes/cart.js");
  api.addFiles("routes/dashboard.js");
  api.addFiles("routes/orders.js");
  api.addFiles("routes/packages.js");
  api.addFiles("client/helpers.js", "client");

  api.export("Router");
  api.export("ReactionRouter");
});
