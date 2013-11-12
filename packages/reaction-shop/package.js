Package.describe({
  summary: "Reaction Shop - commerce package for Reaction platform"
});

Package.on_use(function (api, where) {
  api.use('standard-app-packages');
  api.use(['accounts-base', 'iron-router', 'less'], 'client');

  api.add_files('model/model.js');

  //Loading Select 2 library https://github.com/ivaynberg/select2
  api.add_files('lib/select2/select2.js', 'client');
  api.add_files('lib/select2/select2.css', 'client');
  api.add_files('lib/select2-bootstrap-css/select2-bootstrap.css', 'client');

  api.add_files([
    // Dashboard
    'client/templates/dashboard/shopnav/shopnav.html',
    'client/templates/dashboard/shopnav/shopnav.js',

    'client/templates/dashboard/shopwelcome/shopwelcome.html',
    'client/templates/dashboard/shopwelcome/shopwelcome.css',

    'client/templates/dashboard/customers/customers.html',
    'client/templates/dashboard/customers/customers.js',

    'client/templates/dashboard/orders/orders.html',
    'client/templates/dashboard/orders/orders.js',

    'client/templates/products/products.html',
    'client/templates/products/products.less',
    'client/templates/products/productList/productList.html',
    'client/templates/products/productList/productList.js',

    'client/templates/productsEdit/productsEdit.html',
    'client/templates/productsEdit/productsEdit.js',
    'client/templates/productsEdit/productImage/productImage.html',
    'client/templates/productsEdit/productImage/productImage.js',
    'client/templates/productsEdit/productImageGallery/productImageGallery.html',
    'client/templates/productsEdit/productImageGallery/productImageGallery.js',
    'client/templates/productsEdit/productVideos/productVideos.html',
    'client/templates/productsEdit/productVideos/productVideos.js',
    'client/templates/productsEdit/variant/variant.html',
    'client/templates/productsEdit/variant/variant.js',
    'client/templates/productsEdit/variant/variantEditModal/variantEditModal.html',
    'client/templates/productsEdit/variant/variantEditModal/variantEditModal.js',
    'client/templates/productsEdit/variant/variantEditModal/variantEditModal.less',

    // Storefront
    'client/templates/storefront/default/shop/shop.html',
    'client/templates/storefront/default/shop/shop.less',

    // Package
    'client/subscribe.js',
    'client/router.js'
  ], 'client');

  api.add_files([
    'server/fixtures.js',
    'server/publications.js',
    'server/register.js'
  ], 'server');

  api.export(['Products', 'Orders', 'Customers', 'variant']);
});
