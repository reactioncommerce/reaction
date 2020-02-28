export default {
  async shouldNavigationTreeItemsBeAdminOnly(settings, args, context) {
    await context.validatePermissions("reaction:legacy:navigationTreeItems", "create", { shopId: settings.shopId });
    return settings.shouldNavigationTreeItemsBeAdminOnly;
  },
  async shouldNavigationTreeItemsBePubliclyVisible(settings, args, context) {
    await context.validatePermissions("reaction:legacy:navigationTreeItems", "create", { shopId: settings.shopId });
    return settings.shouldNavigationTreeItemsBePubliclyVisible;
  },
  async shouldNavigationTreeItemsBeSecondaryNavOnly(settings, args, context) {
    await context.validatePermissions("reaction:legacy:navigationTreeItems", "create", { shopId: settings.shopId });
    return settings.shouldNavigationTreeItemsBeSecondaryNavOnly;
  }
};
