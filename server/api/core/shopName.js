import { Shops } from "/lib/collections";
import { Logger } from "/server/api";

/**
 *  setShopName
 *  @private setShopName
 *  @param {Object} shop - shop
 *  @summary when new shop is created, set shop name if REACTION_SHOP_NAME env var exists
 *  @returns {undefined} undefined
 */
export function setShopName(shop) {
  const shopName = process.env.REACTION_SHOP_NAME;

  if (shopName) {
    // if this shop name has already been used, don't use it again
    if (!!Shops.findOne({
      name: shopName
    })) {
      Logger.info(`Default shop name ${shopName} already used`);
    } else {
      // update the shop name with the REACTION_SHOP_NAME env var
      try {
        Shops.update({
          _id: shop._id
        }, {
          $set: {
            name: shopName
          }
        });
      } catch (err) {
        Logger.error("Failed to update shop name", err);
      }
    }
  }
}
