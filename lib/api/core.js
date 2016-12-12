import { Meteor } from "meteor/meteor";

// Export Reaction using commonJS style for common libraries to use Reaction easily
// https://docs.meteor.com/packages/modules.html#CommonJS
let Core;

if (Meteor.isServer) {
  Core = require("/server/api");
} else if (Meteor.isClient) {
  Core = require("/client/api");
}

const getSellerShopId = function() {
  if(Meteor.isClient) {
    console.log("sellerShopId ",Core.Reaction.getSellerShopId());
    return Core.Reaction.getSellerShopId();
  }

  console.log("sellerShopId ", Meteor.call("shop/getSellerShopId"));
  return Meteor.call("shop/getSellerShopId");
}

const Reaction = Object.assign({}, Core.Reaction, {
  getSellerShopId
});

export {
  Reaction
};
