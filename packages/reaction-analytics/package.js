Package.describe({
  summary: "Reaction Analytics - Integrate third-party analytics libraries",
  name: "reactioncommerce:reaction-analytics",
  version: "1.2.2",
  documentation: "README.md"
});

Package.registerBuildPlugin({
  name: "analyticsConfigurator",
  use: [
    "underscore@1.0.3",
    "reactioncommerce:reaction-analytics-libs@1.1.0"
  ],
  sources: [
    "server/buildtools/analyticsSources.js",
    "server/buildtools/defaultConfiguration.js",
    "server/buildtools/analyticsConfigurator.js"
  ],
  npmDependencies: {}
});

Package.on_use(function (api) {
  api.versionsFrom("METEOR@1.2");
  // meteor base packages
  api.use("meteor-base");
  api.use("mongo");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("jquery");
  api.use("tracker");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("spacebars");
  api.use("check");
  api.use("ecmascript");

  // meteor add-on packages

  api.use("less");
  api.use("browser-policy-content", "server");
  api.use("reactioncommerce:reaction-router@1.0.0");
  api.use("reactioncommerce:core@0.11.0");
  api.use("reactioncommerce:reaction-analytics-libs@1.1.0", "client");

  api.addFiles([
    // "common/router.js",  // replaced by registry + reaction-router
    "common/collections.js",
    "common/hooks.js"
  ], ["client", "server"]);

  api.addFiles([
    "client/startup.js",
    "client/templates/reactionAnalytics/reactionAnalytics.html",
    "client/templates/reactionAnalytics/reactionAnalytics.js"
  ], ["client"]);

  api.addFiles([
    "server/security/browserPolicy.js",
    "server/security/AnalyticsEvents.js",
    "server/publications.js",
    "server/register.js"
  ], ["server"]);
});
