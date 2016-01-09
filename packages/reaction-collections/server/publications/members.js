/* eslint quote-props: 0 */
/**
 * ShopMembers
 * @return {Array} users
 */
Meteor.publish("ShopMembers", function () {
  // here we are comparing with the string to make it compatible with tests
  if (typeof this.userId !== "string") {
    return this.ready();
  }
  let permissions = ["dashboard/orders", "owner", "admin", "dashboard/customers"];
  let shopId = ReactionCore.getShopId();

  if (Roles.userIsInRole(this.userId, permissions, shopId)) {
    // seems like we can't use "`" inside db.call directly
    const rolesShopId = `roles.${shopId}`;
    return Meteor.users.find({
      rolesShopId: {
        $nin: ["anonymous"]
      }
    }, {
      fields: {
        _id: 1,
        email: 1,
        username: 1,
        roles: 1,

        // Google
        "services.google.name": 1,
        "services.google.email": 1,
        "services.google.picture": 1,

        // Twitter
        "services.twitter.name": 1,
        "services.twitter.email": 1,
        "services.twitter.profile_image_url_https": 1,

        // Facebook
        "services.facebook.name": 1,
        "services.facebook.email": 1,
        "services.facebook.id": 1,

        // Weibo
        "services.weibo.name": 1,
        "services.weibo.email": 1,
        "services.weibo.picture": 1,

        // Github
        "services.github.name": 1,
        "services.github.email": 1,
        "services.github.username": 1
      }
    });
  }

  ReactionCore.Log.debug("ShopMembers access denied");
  return this.ready();
});
