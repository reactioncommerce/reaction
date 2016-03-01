Package.describe({
  summary: "Reaction Commerce Core",
  name: "reactioncommerce:core",
  version: "0.12.0",
  documentation: "README.md"
});

Npm.depends({
  "node-geocoder": "3.0.0"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");

  // meteor base packages
  api.use("meteor-base");
  api.use("mongo");
  api.use("ecmascript");
  api.use("es5-shim");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("jquery");
  api.use("tracker");
  api.use("ddp-rate-limiter");
  api.use("underscore");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("check");
  api.use("less");
  api.use("http");
  api.use("reactive-var");
  api.use("reactive-dict");
  api.use("email");
  api.use("browser-policy");
  api.use("service-configuration");
  api.use("amplify@1.0.0");
  api.use("mdg:validated-method@1.0.1");
  api.use("react-template-helper@0.2.3");

  // meteor authentication packages
  api.use("oauth-encryption");
  api.use("accounts-base");
  api.use("accounts-password");

  // community packages
  api.use("mquandalle:bower@1.5.2_1");
  api.use("underscorestring:underscore.string@3.2.2");
  api.use("reactioncommerce:reaction-logger");
  api.use("reactioncommerce:reaction-collections@2.0.1");
  api.use("reactioncommerce:reaction-email-templates@0.1.0");
  api.use("aldeed:template-extension@4.0.0", "client");
  api.use("aldeed:autoform@5.8.1");
  api.use("momentjs:moment@2.11.1");
  api.use("risul:moment-timezone@0.5.0_5");

  // imply exports package vars
  api.imply("less");
  api.imply("ejson");
  api.imply("session");
  api.imply("tracker");
  api.imply("amplify");
  api.imply("accounts-base");
  api.imply("ecmascript");
  api.imply("es5-shim");
  api.imply("browser-policy");
  api.imply("service-configuration");
  api.imply("reactioncommerce:reaction-logger");
  api.imply("reactioncommerce:reaction-collections");
  api.imply("reactioncommerce:reaction-email-templates");
  api.imply("aldeed:autoform");
  api.imply("aldeed:template-extension");
  api.imply("mdg:validated-method");
  api.imply("momentjs:moment");

  // reaction core dependencies
  api.addFiles("lib/bower.json", "client");
  api.addFiles("lib/bower/jquery.ui/ui/core.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/widget.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/mouse.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/position.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/autocomplete.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/sortable.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/draggable.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/droppable.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/effect.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/effect-slide.js", "client");
  api.addFiles("lib/bower/jquery.ui/ui/menu.js", "client");
  api.addFiles("lib/bower/autosize/dist/autosize.js", "client");
  api.addFiles("lib/bower/openexchangerates.accounting/accounting.min.js", "client");
  api.addFiles("lib/bower/openexchangerates.money/money.js", "client");
  api.addFiles("lib/bower/jquery.tagsinput/dist/jquery.tagsinput.min.css", "client");
  api.addFiles("lib/css/jquery-ui.css", "client");
  api.addFiles("lib/geocoder.js", ["server"]);

  // exports
  api.addFiles("common/global.js");

  // init reaction core
  // import fixture data
  api.addFiles("server/logger.js", "server");
  api.addFiles("server/import.js", "server");
  api.addFiles("server/init.js", "server");
  api.addFiles("client/main.js", "client");
  api.addFiles("server/main.js", "server");

  // reaction registry
  api.addFiles("server/registry/assignRoles.js", "server");
  api.addFiles("server/registry/setDomain.js", "server");
  api.addFiles("server/registry/loadPackages.js", "server");
  api.addFiles("server/registry/loadSettings.js", "server");
  api.addFiles("server/registry/defaultAdmin.js", "server");
  api.addFiles("server/registry/shopName.js", "server");
  api.addFiles("server/registry/registry.js", "server");
  // finish init
  api.addFiles("server/register.js", "server");
  api.addFiles("common/common.js");

  // security
  api.addFiles("server/browserPolicy.js", "server");

  // cron jobs
  api.addFiles("server/jobs.js", "server");

  api.addFiles("common/hooks/orders.js");

  // methods
  api.addFiles("server/methods/cart.js", "server");
  api.addFiles("server/methods/orders.js", "server");
  api.addFiles("server/methods/products.js", "server");
  api.addFiles("server/methods/shipping.js", "server");
  api.addFiles("server/methods/shop.js", "server");

  // method hooks
  api.addFiles("server/methods/hooks/hooks.js");
  api.addFiles("server/methods/hooks/cart.js", "server");

  // misc hooks
  api.addFiles("server/hooks.js", "server");

  api.addFiles("server/methods/workflows/orders.js", "server");

  // client
  api.addFiles("client/helpers/layout.js", "client");
  api.addFiles("client/helpers/apps.js", "client");
  api.addFiles("client/helpers/globals.js", "client");
  api.addFiles("client/helpers/permissions.js", "client");
  api.addFiles("client/helpers/utilities.js", "client");

  api.addFiles("client/components/numericInput/numericInput.html", "client");
  api.addFiles("client/components/numericInput/numericInput.js", "client");

  // Exports
  api.export("ReactionCore");
  api.export("ReactionImport");
  api.export("ReactionRegistry", "server");
});


Package.onTest(function (api) {
  api.use("meteor-base");
  api.use("underscore");
  api.use("ecmascript");
  api.use("random");
  api.use("sanjo:jasmine@0.21.0");
  api.use("velocity:html-reporter@0.9.1");
  api.use("velocity:console-reporter@0.1.4");

  api.use("accounts-base");
  api.use("accounts-password");

  // reaction core
  api.use("reactioncommerce:reaction-checkout@1.0.0");
  api.use("reactioncommerce:reaction-collections@2.0.1");
  api.use("reactioncommerce:reaction-factories@0.4.0");
  api.use("reactioncommerce:core@0.12.0");

  // server integration tests
  api.addFiles("tests/jasmine/server/integration/methods.js", "server");
  api.addFiles("tests/jasmine/server/integration/shops.js", "server");
  api.addFiles("tests/jasmine/server/integration/products.js", "server");
  api.addFiles("tests/jasmine/server/integration/cart.js", "server");
});
