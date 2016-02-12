Package.describe({
  name: 'getoutfitted:reaction-local-delivery',
  version: '0.1.0',
  summary: 'Mapping and transit information for local deliveries. '
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.2');
  api.use('meteor-platform');
  api.use('less');
  api.use('http');
  api.use('underscore');
  api.use('reactioncommerce:core@0.11.0');
  api.use('reactioncommerce:reaction-accounts@1.5.2');
  api.use('iron:router@1.0.12');
  api.use('momentjs:moment@2.10.6');
  api.use('momentjs:twix@0.7.2');
  api.use('standard-minifiers');
  api.use('dburles:factory@0.3.10');
  api.use('getoutfitted:reaction-advanced-fulfillment@0.6.0');
  api.use('underscorestring:underscore.string@3.2.2');
  api.use('pauloborges:mapbox@2.2.3_2');

  api.addFiles('lib/startup.js', ['server', 'client']);

  api.addFiles([
    'client/templates/settings/settings.html',
    'client/templates/settings/settings.js',
    'client/templates/dashboard/dashboard.html',
    'client/templates/dashboard/dashboard.js',
    'client/templates/routes/myRoute.html',
    'client/templates/routes/myRoute.js',
    'client/templates/routes/myRoute.css'
  ], 'client');

  api.addFiles([
    'server/registry.js',
    'server/publications/localOrders.js',
    'server/methods/deliveries.js',
    'server/browserPolicy.js'
  ], 'server');

  api.addFiles([
    'common/router.js',
    'common/collections.js'
  ], ['client', 'server']);
});
