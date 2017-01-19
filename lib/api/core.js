import { Meteor } from "meteor/meteor";
import { Shops } from "/lib/collections";

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
  else {
    console.log("sellerId 1: ", sellerId);
    sellerId = Meteor.call("shop/getSellerShopId", sellerId);
  }
console.log("sellerId ", sellerId, Meteor.isClient);

  if (sellerId) {
    const group = Roles.getGroupsForUser(sellerId, "admin")[0];
    if (group) {
      return group;
    }
  }

  return Reaction.getShopId();
}

function getSellerShop() {
  const _id = getSellerShopId();
  console.log("shopId ", _id);
  if(Meteor.isClient) {
    Meteor.call("shop/getSellerShop", _id, (error, shop) => {
      return shop;
    });

    return;
  }

  return  Meteor.call("shop/getSellerShop");
}

const Reaction = Object.assign({}, Core.Reaction, {
  getSellerShopId,
  getSellerShop
});

export {
  Reaction
};
