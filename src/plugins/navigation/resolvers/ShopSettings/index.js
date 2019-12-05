export default {
  async shouldNavigationTreeItemsBeAdminOnly(settings, args, context) {
    await context.checkPermissions(["admin"], settings.shopId);
    return settings.shouldNavigationTreeItemsBeAdminOnly;
  },
  async shouldNavigationTreeItemsBePubliclyVisible(settings, args, context) {
    await context.checkPermissions(["admin"], settings.shopId);
    return settings.shouldNavigationTreeItemsBePubliclyVisible;
  },
  async shouldNavigationTreeItemsBeSecondaryNavOnly(settings, args, context) {
    await context.checkPermissions(["admin"], settings.shopId);
    return settings.shouldNavigationTreeItemsBeSecondaryNavOnly;
  }
};
