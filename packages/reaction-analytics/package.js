Package.describe({
  summary: "Reaction Analytics - Capture and Store Analytics",
  name: "spencern:reaction-analytics",
  version: "0.0.1",
  git: "https://github.com/spencern/reaction-analytics.git"
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use("meteor-platform@1.2.1");
  api.use("coffeescript");
  api.use("less");
  api.use("reactioncommerce:core@0.4.1");

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
    "server/security/AnalyticsEvents.coffee",
    "server/publications.coffee",
    "server/register.coffee"
  ], ["server"]);
});
