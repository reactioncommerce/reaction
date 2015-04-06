Package.describe({
  summary: "Reaction Analytics - Integrate third-party analytics libraries",
  name: "spencern:reaction-analytics",
  version: "0.0.3",
  git: "https://github.com/spencern/reaction-analytics.git"
});

Package.registerBuildPlugin({
  name: 'analyticsConfigurator',
  use: [
    'underscore@1.0.3',
    'spencern:reaction-analytics-libs@0.0.1'
  ],
  sources: [
    'server/buildtools/analyticsSources.js',
    'server/buildtools/defaultConfiguration.js',
    'server/buildtools/analyticsConfigurator.js'
  ],
  npmDependencies: {}
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.1");
  api.use("coffeescript");
  api.use("less");
  api.use("jquery");
  api.use('browser-policy-content', 'server');
  api.use('iron:router@1.0.7', 'client');
  api.use("reactioncommerce:core@0.4.1");
  api.use("spencern:reaction-analytics-libs@0.0.1", 'client');

  api.addFiles([
    "common/routing.coffee",
    "common/collections.coffee"
  ], ["client", "server"]);

  api.addFiles([
    "client/startup.coffee",
    "client/templates/reactionAnalytics/reactionAnalytics.html",
    "client/templates/reactionAnalytics/reactionAnalytics.coffee"
  ], ["client"]);

  api.addFiles([
    "server/security/browserPolicy.coffee",
    "server/security/AnalyticsEvents.coffee",
    "server/publications.coffee",
    "server/register.coffee"
  ], ["server"]);
});
