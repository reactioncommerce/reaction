import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";


Meteor.methods({

  /**
   * shop/getSeller
   * @summary Get a shop's seller
   * @param {Object} shopId An optional shopId to get the seller for, otherwise current user is used
   * @returns {Object|null} - The user hash if found, null otherwise
   */
  "marketplace/getSeller": function (shopId) {
    let sellerShopId;
    check(shopId, String);

    if (!shopId) {
      const currentUser = Meteor.user();
      if (currentUser) {
        sellerShopId = Roles.getGroupsForUser(currentUser.id, "admin")[0];
      }
    } else {
      sellerShopId = shopId;
    }

    return Accounts.findOne({ shopId:sellerShopId });
  },


  "marketplace/getSellerShop": function (shopId = Reaction.getSellerShopId()) {
    check(shopId, String);

    const domain = Reaction.getDomain();
    const query = {
      domains: domain
    };
    if (shopId) {
      query._id = shopId;
    }

    const cursor = Shops.findOne(query);

    // const currentShopCursor = this.getCurrentShopCursor(shopId);

    // also, we could check in such a way: `currentShopCursor instanceof Object`
    // but not instanceof something.Cursor
    if (cursor.count()) {
      return cursor.fetch()[0];
    }
    return null;
  },

  "marketplace/updateShopDetails": function (doc, _id) {
    check(_id, String);
    check(doc, Object);

    if (!Reaction.hasPermission("admin", this.userId, Reaction.getSellerShopId(this.userId))) {
      return;
    }

    Shops.update(_id, doc, function (error) {
      if (error) {
        throw new Meteor.Error(500, error.message);
      }
    });
  }

});

