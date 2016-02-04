Package.describe({
  summary: "Reaction Layout",
  name: "reactioncommerce:reaction-layout",
  version: "0.1.0",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2");

  // meteor base packages
  api.use("meteor-base");
  api.use("mongo");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("jquery");
  api.use("tracker");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("spacebars");
  api.use("check");
  api.use("react");
  api.use("less");

  api.use("reactioncommerce:core@0.12.0");

  api.addFiles("server/register.js", "server");
});
