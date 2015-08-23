Shops = ReactionCore.Collections.Shops;
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
          'settings.public': true
        }
      });
    }
  } else {
    return [];
  }
});


/**
* shops
*  @returns {Cursor} shop - current shop
*/

Meteor.publish('Shops', function() {
  return ReactionCore.getCurrentShopCursor(this);
});


/**
 * ShopMembers
 */

Meteor.publish('ShopMembers', function() {
  var permissions, shopId;
  permissions = ['dashboard/orders', 'owner', 'admin', 'dashboard/customers'];
  shopId = ReactionCore.getShopId(this);
  if (Roles.userIsInRole(this.userId, permissions, shopId)) {
    return Meteor.users.find('roles.' + {
      shopId: {
        $nin: ['anonymous']
      }
    }, {
      fields: {
        _id: 1,
        email: 1,
        username: 1,
        roles: 1
      }
    });
  } else {
    ReactionCore.Events.info("ShopMembers access denied");
    return [];
  }
});
