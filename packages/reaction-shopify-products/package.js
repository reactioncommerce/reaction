Package.describe({
  summary: 'Import products from existing Shopify store into ReactionCommerce',
  name: 'getoutfitted:reaction-shopify-products',
  version: '0.3.0',
  git: 'https://github.com/getoutfitted/reaction-shopify-products'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.2');
  api.use('meteor-platform');
  api.use('less');
  api.use('http');
  api.use('underscore');
  api.use('reactioncommerce:core@0.11.0');
  api.use('reactioncommerce:reaction-accounts@1.6.2');
  api.use('iron:router@1.0.12');
  api.use('momentjs:moment@2.10.6');
  api.use('momentjs:twix@0.7.2');
  api.use('harrison:papa-parse@1.1.1');
  api.use('getoutfitted:reaction-rental-products@0.2.0');

  api.addFiles('lib/shopifyProducts.js');
  api.addFiles('common/schemas/packageConfig.js'); // Package Config
  api.addFiles('server/register.js', 'server'); // Register as reaction package

  api.addFiles('common/common.js'); // Register package wide common functions.

  // Schemas
  api.addFiles('common/schemas/shopifyProducts.js');
  api.addFiles('common/schemas/bundles.js');
  api.addFiles('common/collections.js');
  api.addFiles('server/publications.js', 'server');
  api.addFiles('server/security.js', 'server');

  api.addFiles('server/methods/importProducts.js', 'server');
  api.addFiles('server/methods/importCSVProducts.js', 'server');
  api.addFiles('server/methods/bundles.js', 'server');
  api.addFiles('server/methods/bundleUpdater.js');

  api.addFiles('common/routes.js');

  api.addFiles('client/templates/settings/settings.html', 'client');
  api.addFiles('client/templates/settings/settings.js', 'client');
  api.addFiles('client/templates/dashboard/dashboard.html', 'client');
  api.addFiles('client/templates/dashboard/dashboard.js', 'client');
  api.addFiles('client/templates/dashboard/bundles/bundles.html', 'client');
  api.addFiles('client/templates/dashboard/bundles/bundles.js', 'client');
  api.addFiles('client/templates/dashboard/bundles/bundleDetail/bundle.html', 'client');
  api.addFiles('client/templates/dashboard/bundles/bundleDetail/bundle.js', 'client');
});

Package.onTest(function (api) {
  api.use('sanjo:jasmine@0.20.2');
  api.use('underscore');
  api.use('dburles:factory@0.3.10');
  api.use('velocity:html-reporter@0.9.0');
  api.use('velocity:console-reporter@0.1.3');
  api.use('velocity:helpers');
  // api.use('reactioncommerce:reaction-factories');

  api.use('reactioncommerce:core@0.11.0');
  api.use('getoutfitted:reaction-shopify-products@0.3.0');
});
