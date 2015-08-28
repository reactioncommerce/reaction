Packages = ReactionCore.Collections.Packages;

/**
 *  Packages contains user specific configuration
 *  settings, package access rights
 *  @params {Object} shop - current shop object
 */

Meteor.publish('Packages', function(shop) {
  check(shop, Match.Optional(Object));
  shop = shop || ReactionCore.getCurrentShop(this);
  if (shop) {
    if (Roles.userIsInRole(this.userId, ['dashboard', 'owner', 'admin'], ReactionCore.getShopId(this) || Roles.userIsInRole(this.userId, ['owner', 'admin'], Roles.GLOBAL_GROUP))) {
      return Packages.find({
        shopId: shop._id
      });
    } else {
      return Packages.find({
        shopId: shop._id
      }, {
        fields: {
          shopId: true,
          name: true,
          enabled: true,
          registry: true,
          layout: true,
          'settings.public': true
        }
      });
    }
  } else {
    return [];
  }
});
