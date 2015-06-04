Package.describe({
  summary: "Reaction Social - Social Sharing Package for Reaction",
  name: "reactioncommerce:reaction-social",
  version: "0.2.0",
  git: "https://github.com/reactioncommerce/reaction-social.git"
});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.2");
  api.use("templating");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.6.0");

  api.addFiles("server/register.coffee",["server"]); // register as a reaction package
  api.addFiles("server/policy.coffee",["server"]); // browser-policies

  api.addFiles([
    "common/routing.coffee",
    "common/schemas.coffee"   // Social Apps Config
  ], ["client","server"]);

  api.addFiles([
    "client/templates/social.html",
    "client/templates/social.coffee",

    "client/templates/dashboard/social.html",
    "client/templates/dashboard/social.coffee",

    "client/templates/apps/facebook.html",
    "client/templates/apps/facebook.coffee",
    "client/templates/apps/googleplus.html",
    "client/templates/apps/googleplus.coffee",
    "client/templates/apps/pinterest.html",
    "client/templates/apps/pinterest.coffee",
    "client/templates/apps/twitter.html",
    "client/templates/apps/twitter.coffee",
  ], ["client"]);
});
