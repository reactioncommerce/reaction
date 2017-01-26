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

function getSellerShopId(userId) {
  let sellerId = userId;

  if(Meteor.isClient && !sellerId) {
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

  return SellerShops.findOne({_id});
}

const Reaction = Object.assign({}, Core.Reaction, {
  getSellerShopId,
  getSellerShop
});

export {
  Reaction
};
