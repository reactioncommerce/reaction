Package.describe({
  summary: "Reaction Shipping - Flat Rate shipping for Reaction Commerce",
  name: "reactioncommerce:reaction-shipping",
  version: "0.4.0",
  git: "https://github.com/reactioncommerce/reaction-shipping.git"
});


Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.1");
  api.use("templating");
  api.use("less");
  api.use("reactioncommerce:core@0.6.1",["client","server"]);

  api.addFiles([
    "common/collections.js", // any unique collections
    "common/routing.js" // add routing for administration templates
  ],["client","server"]);

  api.addFiles("server/register.js",["server"]); // register as a reaction package
  api.addFiles("server/methods.js",["server"]); // server methods
  api.addFiles("server/fixtures.js",["server"]); // fixtures
  api.addFiles('private/data/Shipping.json', 'server', {isAsset: true});// fixture data

  api.addFiles([
    // admin screens
    "client/templates/shipping.html",
    "client/templates/shipping.js",
    "client/templates/shipping.less",
    // checkout templates
    "client/templates/cart/checkout/shipping/shipping.html",
    "client/templates/cart/checkout/shipping/shipping.js"
  ],
  ["client"]);
});
