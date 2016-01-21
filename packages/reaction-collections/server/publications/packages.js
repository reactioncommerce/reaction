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
  const {
    Packages
  } = ReactionCore.Collections;
  const shop = shopCursor || ReactionCore.getCurrentShop();
  // we should always have a shop
  if (shop) {
    // if admin user, return all shop properties
    if (Roles.userIsInRole(this.userId, ["dashboard", "owner", "admin"],
        ReactionCore.getShopId() || Roles.userIsInRole(this.userId, [
          "owner", "admin"
        ], Roles.GLOBAL_GROUP))) {
      return Packages.find({
        shopId: shop._id
      }, {
        sort: {
          name: 1
        }
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
        "settings.public": 1
      }
    }, {
      sort: {
        name: 1
      }
    });
  }
  return this.ready();
});
