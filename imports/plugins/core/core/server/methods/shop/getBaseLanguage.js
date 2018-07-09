import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";

/**
 * @name shop/getBaseLanguage
 * @method
 * @memberof Shop/Methods
 * @summary Return the shop's base language ISO code
 * @return {String} ISO lang code
 */
export default function getBaseLanguage() {
  if (!Reaction.hasPermission()) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }
  const shopId = Reaction.getShopId();
  return Shops.findOne(shopId).language;
}
