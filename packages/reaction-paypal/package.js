Package.describe({
  summary: "Reaction Paypal - Paypal payments for Reaction Commerce"
});

Npm.depends({'paypal-rest-sdk': '0.6.4'});

Package.on_use(function (api, where) {
  api.use([
    "templating",
    "coffeescript",
    "iron-router",
    "simple-schema",
    "autoform",
    "underscore-string-latest",
  ], ["client", "server"]);

  api.use([
    "autoform",
    "less",
    "reaction-commerce"
  ], ["client"]);

  api.add_files("common/collections.coffee",["client","server"]);
  api.add_files("lib/paypal.js",["client","server"]);
  api.add_files([
    "client/routing.coffee",
    "client/register.coffee",
    "client/templates/paypal.html",
    "client/templates/paypal.less",
    "client/templates/paypal.coffee",
    "client/templates/cart/checkout/payment/methods/paypal/paypal.html",
    "client/templates/cart/checkout/payment/methods/paypal/paypal.less",
    "client/templates/cart/checkout/payment/methods/paypal/paypal.coffee"
  ],
  ["client"]);

  api.export([
    "PaypalPackageSchema",
  ], ["client", "server"]);

});