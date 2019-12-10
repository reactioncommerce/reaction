// ShopSettings are public by default. Here we add a permission check.
export default {
  async isShippingRatesFulfillmentEnabled(settings, args, context) {
    await context.validatePermissions("reaction:fulfillment", "read", {
      shopId: settings.shopId,
      legacyRoles: ["admin"]
    });
    return settings.isShippingRatesFulfillmentEnabled;
  }
};
