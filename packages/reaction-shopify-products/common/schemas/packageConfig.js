ReactionCore.Schemas.ShopifyProductsPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
    'settings.shopify.shopname': {
      type: String,
      label: 'Shopify Shop Name',
      optional: true
    },
    'settings.shopify.key': {
      type: String,
      label: 'Shopify API KEY',
      optional: true
    },
    'settings.shopify.password': {
      type: String,
      label: 'Shopify API Password',
      optional: true
    },
    'settings.shopify.lastUpdatedTime': {
      type: Date,
      label: 'Last time the product data was updated'
    }
  }
]);
