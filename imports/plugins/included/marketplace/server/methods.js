import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Shops, Packages, Jobs } from "/lib/collections";
import { CorePackageConfig } from "/lib/collections/schemas";
import { Logger } from "/server/api";
import { Reaction } from "/lib/api";

Meteor.publish("SellerShops", () => {
  const _id = Reaction.getSellerShopId(this.userId);
  console.log("seller: ", _id);
  return Shops.find(_id);
});

Meteor.methods({

  /**
   * shop/getSeller
   * @summary Get a shop's seller
   * @param {Object} shopId An optional shopId to get the seller for, otherwise current user is used
   * @returns {Object|null} The user hash if found, null otherwise
   */
  "shop/getSeller": function (shopId) {
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


  "shop/getSellerShop": function (shopId = Reaction.getSellerShopId()) {
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

    console.log("shopId ", shopId);

    // const currentShopCursor = this.getCurrentShopCursor(shopId);

    // also, we could check in such a way: `currentShopCursor instanceof Object`
    // but not instanceof something.Cursor
    if (typeof cursor === "object") {
      return cursor.fetch()[0];
    }
    return null;
  }
});
