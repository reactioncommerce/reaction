// ShopSettings are public by default. Here we add a permission check.
export default {
  async isShippingRatesFulfillmentEnabled(settings, args, context) {
    await context.validatePermissions("reaction:legacy:fulfillment", "read", {
      shopId: settings.shopId
    });
    return settings.isShippingRatesFulfillmentEnabled;
  }
};
