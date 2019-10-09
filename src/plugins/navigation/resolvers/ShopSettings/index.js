import ReactionError from "@reactioncommerce/reaction-error";

export default {
  shouldNavigationTreeItemsBeAdminOnly(settings, args, context) {
    if (!context.userHasPermission(["admin"], args.shopId)) {
      throw new ReactionError("access-denied", "Access denied");
    }
    return settings.shouldNavigationTreeItemsBeAdminOnly;
  },
  shouldNavigationTreeItemsBePubliclyVisible(settings, args, context) {
    if (!context.userHasPermission(["admin"], args.shopId)) {
      throw new ReactionError("access-denied", "Access denied");
    }
    return settings.shouldNavigationTreeItemsBePubliclyVisible;
  },
  shouldNavigationTreeItemsBeSecondaryNavOnly(settings, args, context) {
    if (!context.userHasPermission(["admin"], args.shopId)) {
      throw new ReactionError("access-denied", "Access denied");
    }
    return settings.shouldNavigationTreeItemsBeSecondaryNavOnly;
  }
};
