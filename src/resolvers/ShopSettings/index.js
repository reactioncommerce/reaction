// ShopSettings are public by default. Here we add a permission check.
export default {
  async defaultTaxCode(settings, args, context) {
    await context.validatePermissions("reaction:legacy:taxes", "read", {
      shopId: settings.shopId
    });
    return settings.defaultTaxCode;
  },
  async fallbackTaxServiceName(settings, args, context) {
    await context.validatePermissions("reaction:legacy:taxes", "read", {
      shopId: settings.shopId
    });
    return settings.fallbackTaxServiceName;
  },
  async primaryTaxServiceName(settings, args, context) {
    await context.validatePermissions("reaction:legacy:taxes", "read", {
      shopId: settings.shopId
    });
    return settings.primaryTaxServiceName;
  }
};
