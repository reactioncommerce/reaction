/**
 * ReactionCore methods (server)
 */

_.extend(ReactionCore, {
  getCurrentShopCursor: function () {
    let domain = this.getDomain();
    let cursor = ReactionCore.Collections.Shops.find({
      domains: domain
    }, {
      limit: 1
    });
    if (!cursor.count()) {
      ReactionSubscriptions.Log.debug("Add a domain entry to shops for ",
        domain);
    }
    return cursor;
  },
  getCurrentShop: function () {
    const currentShopCursor = this.getCurrentShopCursor();
    // also, we could check in such a way: `currentShopCursor instanceof Object`
    // but not instanceof something.Cursor
    if (typeof currentShopCursor === "object") {
      return currentShopCursor.fetch()[0];
    }
  },
  getShopId: function () {
    const currentShop = this.getCurrentShop();
    if (typeof currentShop === "object") {
      return currentShop._id;
    }
  },
  getDomain: function () {
    let absoluteUrl = Meteor.absoluteUrl();
    if (typeof absoluteUrl === "string") {
      return absoluteUrl.split("/")[2].split(":")[0];
    }
    return "localhost";
  }
});
