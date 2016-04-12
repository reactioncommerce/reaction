Package.describe({
  summary: "Reaction Commerce - Analytics Libraries",
  name: "reactioncommerce:reaction-analytics-libs",
  version: "1.2.0",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.3");

  api.addFiles("analytics-lib.js", "server");
  api.export(["GetAnalyticsLib"]);
  api.addAssets([
    "analytics/googleAnalytics.js",
    "analytics/mixpanel.js",
    "analytics/segmentio.js"
  ], "server");
});
