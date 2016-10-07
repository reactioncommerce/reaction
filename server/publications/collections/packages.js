import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * Packages contains user specific configuration
 * @summary  package publication settings, filtered by permissions
 * @param {Object} shopCursor - current shop object
 * @returns {Object} packagesCursor - current packages for shop
 */
Meteor.publish("Packages", function (shopCursor) {
  check(shopCursor, Match.Optional(Object));

  if (this.userId === null) {
    return this.ready();
  }

  const shop = shopCursor || Reaction.getCurrentShop();

  // we should always have a shop
  if (shop) {
    // if admin user, return all shop properties
    if (Roles.userIsInRole(this.userId, ["dashboard", "owner", "admin"],
        Reaction.getShopId() || Roles.userIsInRole(this.userId, [
          "owner", "admin"
        ], Roles.GLOBAL_GROUP))) {
      return Packages.find({
        shopId: shop._id
      });
    }
    // else we'll just return without private settings
    return Packages.find({
      shopId: shop._id
    }, {
      fields: {
        "shopId": 1,
        "name": 1,
        "enabled": 1,
        "registry": 1,
        "layout": 1,
        "settings.general.enabled": 1,
        "settings.public": 1
      }
    });
  }
  return this.ready();
});
