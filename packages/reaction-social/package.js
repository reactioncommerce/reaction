Package.describe({
  summary: "Reaction Social - Social Sharing Package for Reaction",
  name: "lovetostrike:reaction-social",
  version: "0.1.0",
  git: "https://github.com/lovetostrike/reaction-social.git"
});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.1");
  api.use("templating");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.4.1");
  // api.use(['fortawesome:fontawesome@4.2.0'], 'client');
  // api.use("joshowens:shareit", "client");

  api.addFiles("server/register.coffee",["server"]); // register as a reaction package

  api.addFiles([
    "common/routing.coffee",
    "common/schemas.coffee"   // Social Apps Config
  ], ["client","server"]);

  api.addFiles([
    "client/templates/social.html",
    "client/templates/social.coffee",
    "client/templates/social.less",

    "client/templates/dashboard/social.html",
    "client/templates/dashboard/social.coffee",

    "client/templates/productDetail/widget.html",
    "client/templates/productDetail/widget.coffee",
    "client/templates/productDetail/widget.less",

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
