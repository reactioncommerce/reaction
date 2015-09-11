Shops = ReactionCore.Collections.Shops;
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
