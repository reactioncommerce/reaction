import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Shops } from "/lib/collections";
import { Logger } from "/server/api";
import { Reaction } from "/lib/api";


Meteor.methods({

  /**
   * shop/getSeller
   * @summary Get a shop's seller
   * @param {Object} shopId An optional shopId to get the seller for, otherwise current user is used
   * @returns {Object|null} The user hash if found, null otherwise
   */
  "marketplace/getSeller": function (shopId) {
    let sellerShopId;

    if (!shopId) {
      const currentUser = Meteor.user();
      if (currentUser) {
        sellerShopId = Roles.getGroupsForUser(currentUser.id, "admin")[0];
      }
    }

    const users = Roles.getUsersInRole("admin", sellerShopId);

    return users[0] || null;
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

    const cursor = Shops.find(query, {
      limit: 1
    });

    // const currentShopCursor = this.getCurrentShopCursor(shopId);

    // also, we could check in such a way: `currentShopCursor instanceof Object`
    // but not instanceof something.Cursor
    if (typeof cursor === "object") {
      return cursor.fetch()[0];
    }
    return null;
  },

  "marketplace/updateShopDetails": function (doc, _id) {
    check(_id, String);
    check(doc, Object);

    if (!Reaction.hasPermission("admin")) {
      return;
    }

    Shops.update(_id, doc, function (error) {
      if (error) {
        throw new Meteor.Error(500, error.message);
      } else {
        console.log("Update Successful");
      }
    });
  }

});

