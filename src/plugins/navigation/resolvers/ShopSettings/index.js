export default {
  async shouldNavigationTreeItemsBeAdminOnly(settings, args, context) {
    await context.validatePermissionsLegacy(["admin"], args.shopId);
    await context.validatePermissions("reaction:navigationTreeItems", "create", { shopId: args.shopId });
    return settings.shouldNavigationTreeItemsBeAdminOnly;
  },
  async shouldNavigationTreeItemsBePubliclyVisible(settings, args, context) {
    await context.validatePermissionsLegacy(["admin"], args.shopId);
    await context.validatePermissions("reaction:navigationTreeItems", "create", { shopId: args.shopId });
    return settings.shouldNavigationTreeItemsBePubliclyVisible;
  },
  async shouldNavigationTreeItemsBeSecondaryNavOnly(settings, args, context) {
    await context.validatePermissionsLegacy(["admin"], args.shopId);
    await context.validatePermissions("reaction:navigationTreeItems", "create", { shopId: args.shopId });
    return settings.shouldNavigationTreeItemsBeSecondaryNavOnly;
  }
};
