Package.describe({
  summary: 'Advanced fulfillment tracking for orders through inbound, picking, packing, returns and inventory',
  name: 'getoutfitted:reaction-advanced-fulfillment',
  version: '0.7.0',
  git: 'https://github.com/getoutfitted/reaction-advanced-fulfillment'
});

Npm.depends({
  'faker': '3.0.1',
  'shipping-fedex': '0.1.4'
});


Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.2');
  api.use('meteor-platform');
  api.use('less');
  api.use('http');
  api.use('underscore');
  api.use('standard-minifiers');
  api.use('reactioncommerce:core@0.11.0');
  api.use('reactioncommerce:reaction-accounts@1.6.2');
  api.use('iron:router@1.0.12');
  api.use('momentjs:moment@2.10.6');
  api.use('momentjs:twix@0.7.2');
  api.use('meteorhacks:search-source');
  api.use('steeve:jquery-barcode');
  api.use('d3js:d3');
  api.use('dburles:factory@0.3.10');
  api.use('getoutfitted:reaction-rental-products@0.3.0');
  api.use('rajit:bootstrap3-datepicker@1.4.1', ['client']);

  api.addFiles('lib/fedex.js',  'server');
  api.addFiles('lib/advancedFulfillment.js');

  api.addFiles([
    'server/registry.js',
    'server/advancedFulfillment.js', // Static vars for server.
    'server/search.js',
    'server/hooks/after_copyCartToOrder.js',
    'server/methods/orderDetail.js',
    'server/methods/itemDetails.js',
    'server/methods/customerService.js',
    'server/methods/bulkActions.js',
    'server/publications/afOrders.js'
  ], 'server');

  api.addFiles([
    'common/router.js',
    'common/collections.js'
  ], ['client', 'server']);

  api.addFiles([
    'client/search.js',
    'client/templates/helpers.js',
    'client/templates/settings/settings.html',
    'client/templates/settings/settings.js',
    'client/templates/fulfillmentOrders/fulfillmentOrders.html',
    'client/templates/fulfillmentOrders/fulfillmentOrders.js',
    'client/templates/fulfillmentOrders/returnOrders.html',
    'client/templates/fulfillmentOrders/returnOrders.js',
    'client/templates/dashboard/dashboard.html',
    'client/templates/dashboard/dashboard.js',
    'client/templates/orderDetails/orderDetails.html',
    'client/templates/orderDetails/orderDetails.js',
    'client/templates/orderQueue/orderQueue.html',
    'client/templates/orderQueue/orderQueue.js',
    'client/templates/pdf/advancedFulfillment.html',
    'client/templates/pdf/advancedFulfillment.js',
    'client/templates/pdf/ordersPrinting.html',
    'client/templates/pdf/ordersPrinting.js',
    'client/templates/pdf/localDeliveryLabel.html',
    'client/templates/pdf/localDeliveryLabel.js',
    'client/templates/navbar/afNavbar.html',
    'client/templates/navbar/afNavbar.js',
    'client/templates/missingDamaged/missingDamaged.html',
    'client/templates/missingDamaged/missingDamaged.js',
    'client/templates/orderUpdate/orderUpdate.html',
    'client/templates/orderUpdate/orderUpdate.js',
    'client/templates/search/searchOrders.js',
    'client/templates/search/searchOrders.html',
    'client/templates/orderUpdate/orderUpdateItem/updateOrderItem.html',
    'client/templates/orderUpdate/orderUpdateItem/updateOrderItem.js',
    'client/templates/print/printInvoiceButton.html',
    'client/templates/print/printInvoiceButton.js',
    'client/templates/orderDetails/status/default/defaultStatus.html',
    'client/templates/orderDetails/status/default/defaultStatus.js',
    'client/templates/orderDetails/status/orderPicking/orderPicking.html',
    'client/templates/orderDetails/status/orderPicking/orderPicking.js',
    'client/templates/orderDetails/status/orderPacking/orderPacking.html',
    'client/templates/orderDetails/status/orderPacking/orderPacking.js',
    'client/templates/orderDetails/status/orderPacked/orderPacked.html',
    'client/templates/orderDetails/status/orderPacked/orderPacked.js',
    'client/templates/orderDetails/status/orderReadyToShip/orderReadyToShip.html',
    'client/templates/orderDetails/status/orderReadyToShip/orderReadyToShip.js',
    'client/templates/orderDetails/status/orderReturned/orderReturned.html',
    'client/templates/orderDetails/status/orderReturned/orderReturned.js',
    'client/templates/customerService/impossibleDates/impossibleDates.html',
    'client/templates/customerService/impossibleDates/impossibleDates.js',
    'client/templates/customerService/csDetails/csDetails.html',
    'client/templates/customerService/csDetails/csDetails.js',
    'client/templates/customerService/missingRentalDates/missingRentalDates.html',
    'client/templates/customerService/missingRentalDates/missingRentalDates.js',
    'client/templates/customerService/missingItemDetails/missingItemDetails.html',
    'client/templates/customerService/missingItemDetails/missingItemDetails.js',
    'client/templates/customerService/missingBundleColors/missingBundleColors.html',
    'client/templates/customerService/missingBundleColors/missingBundleColors.js',
    'client/templates/orderDetails/nonPickableItems/nonPickableItems.html',
    'client/templates/orderDetails/nonPickableItems/nonPickableItems.js',
    'client/templates/customerService/nonWarehouseOrders/nonWarehouseOrders.html',
    'client/templates/customerService/nonWarehouseOrders/nonWarehouseOrders.js',

    // Picker templates
    'client/templates/picker/search.html',
    'client/templates/picker/search.js',

    // Delivery labels as a template
    'client/templates/deliveryLabels/deliveryLabels.html',
    'client/templates/deliveryLabels/deliveryLabels.js'
  ], 'client');


  // Public assets go at the bottom, should load last.
  api.addAssets('public/images/go-logo-1000.png', 'client');
  api.addAssets('public/images/logo-horizontal.png', 'client');
});


Package.onTest(function (api) {
  api.use('sanjo:jasmine@0.21.0');
  api.use('underscore');
  api.use('dburles:factory@0.3.10');
  api.use('velocity:html-reporter@0.9.1');
  api.use('velocity:console-reporter@0.1.4');
  api.use('velocity:helpers');
  api.use('reactioncommerce:reaction-factories');

  api.use('reactioncommerce:core@0.11.0');
  api.use('getoutfitted:reaction-advanced-fulfillment');

  api.addFiles('tests/jasmine/server/integration/methods.js', 'server');
  api.addFiles('tests/jasmine/server/integration/hooks.js', 'server');
});
