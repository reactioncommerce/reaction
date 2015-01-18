Package.describe({
  summary: "Reaction Shipping - Flat Rate shipping for Reaction Commerce",
  name: "reactioncommerce:reaction-shipping",
  version: "0.1.1",
  git: "https://github.com/reactioncommerce/reaction-shipping.git"
});


Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.1");
  api.use("templating");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.2.2");

  api.addFiles([
    "common/register.coffee", // register as a reaction package
    "common/collections.coffee", // any unique collections
    "common/routing.coffee" // add routing for administration templates
  ],["client","server"]);

  api.addFiles("server/methods.coffee",["server"]); // server methods
  api.addFiles("server/fixtures.coffee",["server"]); // fixtures
  api.addFiles('private/data/Shipping.json', 'server', {isAsset: true});// fixture data

  api.addFiles([
    // admin screens
    "client/templates/shipping.html",
    "client/templates/shipping.coffee",
    "client/templates/shipping.less",
    // checkout templates
    "client/templates/cart/checkout/shipping/shipping.html",
    "client/templates/cart/checkout/shipping/shipping.coffee"
  ],
  ["client"]);
});
