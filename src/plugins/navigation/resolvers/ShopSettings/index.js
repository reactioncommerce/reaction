export default {
  async shouldNavigationTreeItemsBeAdminOnly(settings, args, context) {
    await context.checkPermissions(["admin"], args.shopId);
    return settings.shouldNavigationTreeItemsBeAdminOnly;
  },
  async shouldNavigationTreeItemsBePubliclyVisible(settings, args, context) {
    await context.checkPermissions(["admin"], args.shopId);
    return settings.shouldNavigationTreeItemsBePubliclyVisible;
  },
  async shouldNavigationTreeItemsBeSecondaryNavOnly(settings, args, context) {
    await context.checkPermissions(["admin"], args.shopId);
    return settings.shouldNavigationTreeItemsBeSecondaryNavOnly;
  }
};
