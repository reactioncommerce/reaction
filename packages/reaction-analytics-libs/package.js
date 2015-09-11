Package.describe({
  summary: "Reaction Commerce - Analytics Libraries",
  name: "reactioncommerce:reaction-analytics-libs",
  version: "1.0.0",
  git: "https://github.com/reactioncommerce/reaction-analytics-libs.git"
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.addFiles('analytics-lib.js', 'server');
  api.export(['GetAnalyticsLib']);
  api.add_files([
    'analytics/googleAnalytics.js',
    'analytics/mixpanel.js',
    'analytics/segmentio.js'
  ], 'server', {
    isAsset: true
  });
})
