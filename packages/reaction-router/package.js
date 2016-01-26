Package.describe({
  summary: "Router for Reaction Commerce",
  name: "reactioncommerce:reaction-router",
  version: "1.0.0",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");
  api.use("ecmascript");
  api.use("blaze-html-templates");
  // Flow router packages
  api.use("kadira:flow-router");
  api.use("kadira:blaze-layout");

  api.imply("kadira:flow-router");
  api.imply("kadira:blaze-layout");

  api.addFiles("routes/shop.js");
  api.addFiles("routes/dashboard.js");
  api.addFiles("client/helpers.js", "client");
  api.addFiles("routes/main.js");

  api.export("ReactionRouter");
  api.export("Router");
});
