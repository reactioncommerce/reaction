Package.describe({
  summary: "Reaction Shipping - Flat Rate shipping for Reaction Commerce",
  name: "reactioncommerce:reaction-shipping",
  version: "0.1.0",
  git: "https://github.com/reactioncommerce/reaction-shipping.git"
});


Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform");
  api.use("templating");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.2.2");

  api.add_files([
    "common/register.coffee", // register as a reaction package
    "common/collections.coffee", // any unique collections
    "common/routing.coffee" // add routing for administration templates
  ],["client","server"]);

  api.add_files("server/methods.coffee",["server"]); // server methods

  api.add_files([
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
