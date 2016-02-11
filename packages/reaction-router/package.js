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
  api.use("reactioncommerce:reaction-collections@2.0.0");
  // flow-router packages
  api.use("kadira:flow-router@2.10.0");
  api.use("kadira:blaze-layout@2.3.0");
  api.use("kadira:dochead@1.4.0");

  // register reaction package
  api.addFiles("server/register.js", "server");

  // routes
  api.addFiles("routes/layout.js", ["client", "server"]);
  api.addFiles("routes/init.js", ["client", "server"]);

  api.addFiles("routes/shop.js", ["client", "server"]);
  api.addFiles("routes/products.js", ["client", "server"]);
  api.addFiles("routes/tags.js", ["client", "server"]);
  api.addFiles("routes/cart.js", ["client", "server"]);
  api.addFiles("routes/dashboard.js", ["client", "server"]);
  api.addFiles("routes/orders.js", ["client", "server"]);
  api.addFiles("routes/accounts.js", ["client", "server"]);

  // helpers
  api.addFiles("client/helpers.js", "client");

  // exports
  api.imply("kadira:dochead");
  // export router and subscription manager
  api.export("ReactionRouter");
});
