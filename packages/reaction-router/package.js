Package.describe({
  summary: "Router for Reaction Commerce",
  name: "reactioncommerce:reaction-router",
  version: "1.1.0",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");
  api.use("ecmascript");
  api.use("session");
  api.use("tracker");
  api.use("blaze-html-templates");
  api.use("accounts-base");
  api.use("reactioncommerce:reaction-collections@2.0.1");
  // flow-router packages
  api.use("kadira:flow-router-ssr@3.11.2");
  api.use("kadira:blaze-layout@2.3.0");
  api.use("kadira:dochead@1.4.0");

  // register reaction package
  api.addFiles("server/register.js", "server");

  // router configuration
  api.addFiles("common/init.js", ["client", "server"]);
  api.addFiles("common/layout.js", ["client", "server"]);

  // helpers
  api.addFiles("client/helpers.js", "client");

  // exports
  api.imply("kadira:dochead");
  // export router and subscription manager
  api.export("ReactionRouter");
});
