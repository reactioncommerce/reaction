ReactionCore.Collections.ShopifyOrders = ShopifyOrders = this.ShopifyOrders = new Mongo.Collection('ShopifyOrders');

ReactionCore.Schemas.ShopifyOrdersPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
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
    'settings.shopify.sharedSecret': {
      type: String,
      label: 'Shopify Webhook Shared Secret',
      optional: true
    },
    'settings.shopify.shopname': {
      type: String,
      label: 'Shopify Name ',
      optional: true
    },
    'settings.shopify.preSharedKey': {
      type: String,
      label: 'Pre Shared Key - self-generated for authenticating webhooks',
      optional: true
    },
    'settings.fedex.key': {
      type: String,
      label: 'Fedex API key',
      optional: true
    },
    'settings.fedex.password': {
      type: String,
      label: 'Fedex API password',
      optional: true
    },
    'settings.fedex.accountNumber': {
      type: String,
      label: 'Fedex API Account Number',
      optional: true
    },
    'settings.fedex.meterNumber': {
      type: String,
      label: 'Fedex API Meter Number',
      optional: true
    },
    'settings.fedex.liveApi': {
      type: Boolean,
      label: 'Use Live API? (uncheck for testing)',
      optional: true,
      defaultValue: false
    },
    'settings.aftership.preSharedKey': {
      type: String,
      label: 'Pre Shared Key for authenticating webhooks',
      optional: true
    },
    'settings.public.lastUpdated': {
      type: Date,
      label: 'Last Time Orders Were Updated',
      optional: true
    },
    'settings.public.ordersSinceLastUpdate': {
      type: Number,
      label: 'Number of orders since last update',
      optional: true
    }
  }
]);

ReactionCore.Schemas.ShopifyOrderNumber = new SimpleSchema([
  ReactionCore.Schemas.Order, {
    shopifyOrderNumber: {
      type: Number,
      optional: true,
      index: 1
    },
    shopifyOrderId: {
      type: Number,
      optional: true
    },
    shopifyOrderCreatedAt: {
      type: Date,
      optional: true
    },
    infoMissing: {
      type: Boolean,
      optional: true
    },
    itemMissingDetails: {
      type: Boolean,
      optional: true
    },
    bundleMissingColor: {
      type: Boolean,
      optional: true
    }
  }
]);

ReactionCore.Schemas.ShopifyOrders = new SimpleSchema({
  information: {
    type: Object,
    optional: true,
    blackbox: true
  },
  shopifyOrderNumber: {
    type: Number,
    optional: true
  },
  importedAt: {
    type: Date,
    optional: true
  }
});

ReactionCore.Collections.ShopifyOrders.attachSchema(ReactionCore.Schemas.ShopifyOrders);
ReactionCore.Collections.Orders.attachSchema(ReactionCore.Schemas.ShopifyOrderNumber);
