Package.describe({
  summary: "Reaction Commerce Dashboard",
  name: "reactioncommerce:reaction-dashboard",
  version: "1.0.0",
  documentation: "README.md"
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

  // meteor add-on packages
  api.use("underscore");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("check");
  api.use("http");
  api.use("reactive-var");
  api.use("reactive-dict");

  // reaction packages
  api.use("reactioncommerce:core@0.12.0");

  // register package
  api.addFiles("server/register.js", "server");

  // dashboard templates
  api.addFiles("client/templates/dashboard/import/import.html", "client");
  api.addFiles("client/templates/dashboard/import/import.js", "client");

  api.addFiles("client/templates/dashboard/packages/packages.html", "client");

  api.addFiles("client/templates/dashboard/packages/grid/package/package.html", "client");
  api.addFiles("client/templates/dashboard/packages/grid/package/package.js", "client");

  api.addFiles("client/templates/dashboard/packages/grid/grid.html", "client");
  api.addFiles("client/templates/dashboard/packages/grid/grid.js", "client");

  api.addFiles("client/templates/dashboard/dashboard.html", "client");
  api.addFiles("client/templates/dashboard/dashboard.js", "client");

  api.addFiles("client/templates/dashboard/settings/settings.html", "client");
  api.addFiles("client/templates/dashboard/settings/settings.js", "client");

  api.addFiles("client/templates/dashboard/shop/settings/settings.html", "client");
  api.addFiles("client/templates/dashboard/shop/settings/settings.js", "client");
});
