Package.describe({
  summary: "Router for Reaction Commerce",
  name: "reactioncommerce:reaction-router",
  version: "1.1.1",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.3");

  api.use("ecmascript");
  api.use("session");
  api.use("tracker");
  api.use("blaze-html-templates");
  api.use("accounts-base");
  api.use("reactioncommerce:reaction-collections@2.2.0");
  // flow-router packages
  api.use("kadira:flow-router-ssr@3.12.1");
  api.use("kadira:blaze-layout@2.3.0");
  api.use("kadira:dochead@1.4.0");
  // register reaction package
  api.addFiles("server/register.js", "server");

  // title and meta data
  api.addFiles("common/metadata.js");

  // ReactionRouter configuration
  api.addFiles("common/init.js");

  // ReactionLayout
  api.addFiles("common/layout.js");

  // helpers
  api.addFiles("client/helpers.js", "client");

  // export DocHead
  api.imply("kadira:dochead");

  // export router and subscription manager
  api.export("ReactionRouter");
  api.export("ReactionLayout");
});
