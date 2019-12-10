// ShopSettings are public by default. Here we add a permission check.
export default {
  async isShippingRatesFulfillmentEnabled(settings, args, context) {
    await context.checkPermissions(["admin"], settings.shopId);
    return settings.isShippingRatesFulfillmentEnabled;
  }
};
