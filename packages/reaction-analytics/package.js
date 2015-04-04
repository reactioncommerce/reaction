Package.describe({
  summary: "Reaction Analytics - Base analytics package with support for Google Analytics, Segment, Mixpanel, and Kissmetrics for ReactionCommerce",
  name: "spencern:reaction-analytics",
  version: "0.0.2",
  git: "https://github.com/spencern/reaction-analytics.git"
});

Package.registerBuildPlugin({
  name: 'analytics-configurator',
  use: [
    'underscore'
  ],
  sources: [
    'server/buildtools/analytics-sources.js',
    'server/buildtools/defaultConfiguration.js',
    'server/buildtools/analytics-configurator.js'
  ],
  npmDependencies: {}
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@1.0.3.1');
  api.use("meteor-platform@1.2.1");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.4.1");
  api.use('browser-policy-content', 'server');
  api.use('iron:router@1.0.7', 'client', {weak: true});

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
  
  api.addFiles([
    'sources/analytics/google-analytics.js',
    'sources/analytics/mixpanel.js',
    'sources/analytics/segmentio.js'
  ], 'server', {isAsset: true});
});
