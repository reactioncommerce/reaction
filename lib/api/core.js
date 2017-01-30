import { Meteor } from "meteor/meteor";
import { Shops } from "/lib/collections";
import { SellerShops } from "/imports/plugins/included/marketplace/lib/collections";

// Export Reaction using commonJS style for common libraries to use Reaction easily
// https://docs.meteor.com/packages/modules.html#CommonJS
let Core;

if (Meteor.isServer) {
  Core = require("/server/api");
} else if (Meteor.isClient) {
  Core = require("/client/api");
}

/**
 * getSellerShopId
 * @summary Get a seller's shopId or default to parent shopId
 * @param {userId} userId An optional userId to find a shop for
 * @returns {String} The shopId belonging to userId, or loggedIn seller, or the parent shopId
 */
function getSellerShopId(userId) {
  let sellerId = userId;

  if (Meteor.isClient && !sellerId) {
    sellerId = Meteor.userId();
  }

  if (sellerId) {
    const group = Roles.getGroupsForUser(sellerId, "admin")[0];
    if (group) {
      return group;
    }
  }

  return Reaction.getShopId();
}

function getSellerShop(userId) {
  const _id = getSellerShopId(userId);

  if (Meteor.isClient) {
    return SellerShops.findOne({ _id }) || Reaction.getCurrentShop();
  }
  else {
    return Shops.findOne({ _id }) || Reaction.getCurrentShop();;
  }

}

const Reaction = Object.assign({}, Core.Reaction, {
  getSellerShopId,
  getSellerShop
});

export {
  Reaction
};
