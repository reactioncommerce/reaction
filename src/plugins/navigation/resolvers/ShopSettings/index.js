export default {
  async shouldNavigationTreeItemsBeAdminOnly(settings, args, context) {
    await context.validatePermissions("reaction:legacy:navigationTreeItems", "create", { shopId: settings.shopId, legacyRoles: ["admin"] });
    return settings.shouldNavigationTreeItemsBeAdminOnly;
  },
  async shouldNavigationTreeItemsBePubliclyVisible(settings, args, context) {
    await context.validatePermissions("reaction:legacy:navigationTreeItems", "create", { shopId: settings.shopId, legacyRoles: ["admin"] });
    return settings.shouldNavigationTreeItemsBePubliclyVisible;
  },
  async shouldNavigationTreeItemsBeSecondaryNavOnly(settings, args, context) {
    await context.validatePermissions("reaction:legacy:navigationTreeItems", "create", { shopId: settings.shopId, legacyRoles: ["admin"] });
    return settings.shouldNavigationTreeItemsBeSecondaryNavOnly;
  }
};
