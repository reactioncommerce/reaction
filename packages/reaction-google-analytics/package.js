Package.describe({
  summary: "Reaction Google Analytics"
});

Package.on_use(function (api, where) {
  api.use([
    "reaction-commerce",
    "standard-app-packages",
    "coffeescript",
    "simple-schema",
    "collection2",
    "autoform",
    "less",
    "iron-router"
  ], ["client", "server"]);

  api.add_files([
    "common/collections.coffee"
  ], ["client", "server"]);
  api.add_files([
    "client/register.coffee",
    "client/compatibility/google-analytics-bootstrap.js",
    "client/routing.coffee",
    "client/startup.coffee",
    "client/templates/googleAnalytics/googleAnalytics.html",
    "client/templates/googleAnalytics/googleAnalytics.coffee"
  ], ["client"]);
  api.add_files([
    "server/security/AnalyticsEvents.coffee",
    "server/publications.coffee",
    "server/fixtures.coffee"
  ], ["server"]);
});
