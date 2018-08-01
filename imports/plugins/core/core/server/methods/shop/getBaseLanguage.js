import { Reaction } from "/lib/api";
import ReactionError from "/imports/plugins/core/graphql/lib/ReactionError";
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
    throw new ReactionError("access-denied", "Access Denied");
  }
  const shopId = Reaction.getShopId();
  return Shops.findOne(shopId).language;
}
