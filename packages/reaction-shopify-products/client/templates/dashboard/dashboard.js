Template.dashboardShopifyProducts.onCreated(function () {
  this.subscribe('ShopifyProducts/CurrentImport');
});

Template.dashboardShopifyProducts.helpers({
  apiConfigured: function () {
    let shopifyProducts = ReactionCore.Collections.Packages.findOne({
      name: 'reaction-shopify-products'
    });
    if (!shopifyProducts.settings) {
      return false;
    }
    if (shopifyProducts.settings.shopify.key && shopifyProducts.settings.shopify.password && shopifyProducts.settings.shopify.shopname) {
      return true;
    }
    return false;
  },
  productType: function () {
    return Session.get('importShopifyProducts/productType');
  },
  productImport: function () {
    return ReactionCore.Collections.ShopifyProducts.findOne();
  },
  importStatus: function () {
    let currentImport = ReactionCore.Collections.ShopifyProducts.findOne();
    return currentImport;
  }
});

Template.dashboardShopifyProducts.events({
  'keyup #productType, change #productType': function (event) {
    Session.set('importShopifyProducts/productType', event.currentTarget.value);
  },
  'submit #fetch-shopify-products-form': function (event) {
    event.preventDefault();
    let update = event.target.updateIfExists.value === 'true' ? true : false;
    let productType = event.target.productType.value || 'Jacket';
    let importType = event.target.bundleOrProduct.value;

    if (importType === 'bundle') {
      Meteor.call('importShopifyProducts/importBundles');
    } else {
      Meteor.call('importShopifyProducts/importProducts', update, productType);
    }
  },
  'submit #import-products-csv-form': function (event) {
    event.preventDefault();
    Papa.parse(event.target.csvImportProductsFile.files[0], {
      header: true,
      complete: function (results) {
        Meteor.call('importCSVProducts/importProducts', results.data);
      }
    });
  }
});
