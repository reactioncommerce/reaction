/**
 * ReactionCore methods (server)
 */

_.extend(ReactionCore, {
  getCurrentShopCursor: function (client) {
    let domain = this.getDomain(client);
    let cursor = ReactionCore.Collections.Shops.find({
      domains: domain
    }, {
      limit: 1
    });
    if (!cursor.count()) {
      ReactionCollections.Log.debug("Add a domain entry to shops for ",
        domain);
    }
    return cursor;
  },
  getCurrentShop: function (client) {
    if (this.getCurrentShopCursor(client)) {
      let cursor = this.getCurrentShopCursor(client);
      return cursor.fetch()[0];
    }
  },
  getShopId: function (client) {
    if (this.getCurrentShop(client)) {
      return this.getCurrentShop(client)._id;
    }
  },
  getDomain: function () {
    if (Meteor.absoluteUrl()) {
      return Meteor.absoluteUrl().split("/")[2].split(":")[0];
    }
    return "localhost";
  }
});
