/**
 * ShopMembers
 * @return {Array} users
 */
Meteor.publish("ShopMembers", function() {
  let permissions = ["dashboard/orders", "owner", "admin", "dashboard/customers"];
  let shopId = ReactionCore.getShopId(this);

  if (Roles.userIsInRole(this.userId, permissions, shopId)) {
    let users = Meteor.users.find({
      [`roles.${shopId}`]: {
        $nin: ["anonymous"]
      }
    }, {
      fields: {
        _id: 1,
        email: 1,
        username: 1,
        roles: 1
      }
    });

    return users;
  }

  ReactionCore.Events.info("ShopMembers access denied");
  return [];
});
