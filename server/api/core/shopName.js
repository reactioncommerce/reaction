import { Shops } from "/lib/collections";
import { Logger } from "/server/api";

/**
 *  @method setShopName
 *  @memberof Core
 *  @example Reaction.setShopName(shop)
 *  @param {Object} shop - Shops document with `_id` property
 *  @summary when new shop is created, set shop name if REACTION_SHOP_NAME env var exists
 *  @returns {undefined} undefined
 */
export function setShopName(shop) {
  const name = process.env.REACTION_SHOP_NAME;
  if (!name) return;

  // if this shop name has already been used, don't use it again
  const existingShopWithName = Shops.findOne({ name });
  if (existingShopWithName) {
    Logger.info(`Default shop name ${name} already used`);
    return;
  }

  // update the shop name with the REACTION_SHOP_NAME env var
  const { _id } = shop;
  try {
    Shops.update({ _id }, { $set: { name } });
  } catch (err) {
    Logger.error("Failed to update shop name", err);
  }
}
