Package.describe({
  name: "spencern:reaction-analytics-libs",
  summary: "provides access to static analytics libs on server",
  version: "0.0.1",
  git: "https://github.com/spencern/reaction-analytics-libs.git"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0');
  api.addFiles('analytics-lib.js', 'server');
  api.export(['GetAnalyticsLib']);
  api.add_files([
    'analytics/googleAnalytics.js',
    'analytics/mixpanel.js',
    'analytics/segmentio.js'
  ], 'server', {isAsset: true});
})
