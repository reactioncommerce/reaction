Package.describe({
  summary: "Reaction Social - Social Sharing Package for Reaction",
  name: "reactioncommerce:reaction-social",
  version: "0.4.3",
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

  // meteor add-on packages

  api.use("templating");
  api.use("less");
  api.use("reactioncommerce:core@0.12.0");

  api.addFiles("server/register.js", ["server"]); // register as a reaction package
  api.addFiles("server/policy.js", ["server"]); // browser-policies

  api.addFiles([
    "common/schemas.js"   // Social Apps Config
  ], ["client", "server"]);

  api.addFiles([
    "client/templates/social.html",
    "client/templates/social.js",

    "client/templates/dashboard/social.html",
    "client/templates/dashboard/social.js",

    "client/templates/apps/facebook.html",
    "client/templates/apps/facebook.js",
    "client/templates/apps/googleplus.html",
    "client/templates/apps/googleplus.js",
    "client/templates/apps/pinterest.html",
    "client/templates/apps/pinterest.js",
    "client/templates/apps/twitter.html",
    "client/templates/apps/twitter.js"
  ], ["client"]);
});
