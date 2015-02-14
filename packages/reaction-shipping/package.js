Package.describe({
  summary: "Reaction Shipping - Flat Rate shipping for Reaction Commerce",
  name: "reactioncommerce:reaction-shipping",
  version: "0.2.1",
  git: "https://github.com/reactioncommerce/reaction-shipping.git"
});


Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.1");
  api.use("templating");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.4.0");

  api.addFiles([
    "common/collections.coffee", // any unique collections
    "common/routing.coffee" // add routing for administration templates
  ],["client","server"]);

  api.add_files("server/register.coffee",["server"]); // register as a reaction package
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
