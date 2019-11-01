// TODO: pod-auth - revisit this wasn't sure what it was when scanning over everything
export default {
  async shouldNavigationTreeItemsBeAdminOnly(settings, args, context) {
    await context.validatePermissionsLegacy(["admin"], args.shopId);
    return settings.shouldNavigationTreeItemsBeAdminOnly;
  },
  async shouldNavigationTreeItemsBePubliclyVisible(settings, args, context) {
    await context.validatePermissionsLegacy(["admin"], args.shopId);
    return settings.shouldNavigationTreeItemsBePubliclyVisible;
  },
  async shouldNavigationTreeItemsBeSecondaryNavOnly(settings, args, context) {
    await context.validatePermissionsLegacy(["admin"], args.shopId);
    return settings.shouldNavigationTreeItemsBeSecondaryNavOnly;
  }
};
