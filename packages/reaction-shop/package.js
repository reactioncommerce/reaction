Package.describe({
  summary: "Reaction Shop - commerce package for Reaction platform"
});

Package.on_use(function (api, where) {
  api.use([
    'standard-app-packages',
    'coffeescript',
    'simple-schema',
    'collection2',
    'collection-behaviours',
    'reaction-dashboard'
  ]);
  api.use(['autoform', 'accounts-base', 'iron-router', 'less'], 'client');
  api.use('underscore', 'server');

  api.imply('simple-schema', ['client', 'server']);

  api.add_files('model/model.coffee');

  //Loading Select 2 library https://github.com/ivaynberg/select2
  api.add_files('lib/select2/select2.js', 'client');
  api.add_files('lib/select2/select2.css', 'client');
  api.add_files('lib/select2-bootstrap-css/select2-bootstrap.css', 'client');

  api.add_files([
    // Dashboard
    'client/templates/dashboard/shopnav/shopnav.html',
    'client/templates/dashboard/shopnav/shopnav.js',

    'client/templates/dashboard/widget/widget.less',
    'client/templates/dashboard/widget/widget.html',
    'client/templates/dashboard/widget/widget.js',

    'client/templates/dashboard/shopwelcome/shopwelcome.html',
    // 'client/templates/dashboard/shopwelcome/shopwelcome.css',

    'client/templates/dashboard/customers/customers.html',
    'client/templates/dashboard/customers/customers.js',

    'client/templates/dashboard/orders/orders.html',
    'client/templates/dashboard/orders/orders.js',

    'client/templates/products/products.html',
    'client/templates/products/products.less',

    'client/templates/products/productList/productList.html',
    'client/templates/products/productList/productList.coffee',
    'client/templates/products/productList/productList.less',

    'client/templates/productsEdit/productsEdit.html',
    'client/templates/productsEdit/productsEdit.js',
    'client/templates/productsEdit/productsEdit.less',

    'client/templates/productsEdit/productImageGallery/productImageGallery.html',
    'client/templates/productsEdit/productImageGallery/productImageGallery.js',
    'client/templates/productsEdit/productImageGallery/productImageGallery.less',

    // 'client/templates/productsEdit/productVideos/productVideos.html',
    // 'client/templates/productsEdit/productVideos/productVideos.js',
    // 'client/templates/productsEdit/productVideos/productVideos.less',

    'client/templates/productsEdit/variant/variant.html',
    'client/templates/productsEdit/variant/variant.js',

    'client/templates/productsEdit/variant/variantFormModal/variantFormModal.html',
    'client/templates/productsEdit/variant/variantFormModal/variantFormModal.js',
    'client/templates/productsEdit/variant/variantFormModal/variantFormModal.less',

    'client/templates/productsEdit/optionsModal/optionsModal.html',
    'client/templates/productsEdit/optionsModal/optionsModal.js',
    'client/templates/productsEdit/optionsModal/optionsModal.less',
    'client/templates/productsEdit/optionsModal/optionFormGroup/optionFormGroup.html',

    // Package
    'client/subscribe.coffee',
    'client/router.coffee'
  ], 'client');

  api.add_files([
    'server/fixtures.coffee',
    'server/publications.coffee',
    'server/register.coffee'
  ], 'server');

  api.export([
    'Products',
    'Orders',
    'Customers',
    'ProductVariantSchema',
    'ProductMediaSchema',
    'MetafieldSchema',
    'variant'
  ]);

  api.export('ShopRoles');

  api.add_files('shopRoles/shop_roles_server.coffee', 'server');
  api.add_files('shopRoles/shop_roles_common.coffee');
  api.add_files('shopRoles/shop_roles_client.coffee', 'client');
});
