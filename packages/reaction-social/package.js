Package.describe({
  summary: "Reaction Social - Social Sharing Package for Reaction",
  name: "reactioncommerce:reaction-social",
  version: "0.3.0",
  git: "https://github.com/reactioncommerce/reaction-social.git"
});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform");
  api.use("templating");
  api.use("less");
  api.use("reactioncommerce:core@0.7.0");

  api.addFiles("server/register.js",["server"]); // register as a reaction package
  api.addFiles("server/policy.js",["server"]); // browser-policies

  api.addFiles([
    "common/routing.js",
    "common/schemas.js"   // Social Apps Config
  ], ["client","server"]);

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
    "client/templates/apps/twitter.js",
  ], ["client"]);
});
