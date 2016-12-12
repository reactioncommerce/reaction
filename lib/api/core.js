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
    return Core.Reaction.getSellerShopId();
  }

  return Meteor.call("shop/getSellerShopId");
}

const Reaction = Object.assign({}, Core.Reaction, {
  getSellerShopId
});

export {
  Reaction
};
