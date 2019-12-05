// ShopSettings are public by default. Here we add a permission check.
export default {
  async defaultTaxCode(settings, args, context) {
    await context.checkPermissions(["admin", "tax-settings/write", "tax-settings/read"], settings.shopId);
    return settings.defaultTaxCode;
  },
  async fallbackTaxServiceName(settings, args, context) {
    await context.checkPermissions(["admin", "tax-settings/write", "tax-settings/read"], settings.shopId);
    return settings.fallbackTaxServiceName;
  },
  async primaryTaxServiceName(settings, args, context) {
    await context.checkPermissions(["admin", "tax-settings/write", "tax-settings/read"], settings.shopId);
    return settings.primaryTaxServiceName;
  }
};
