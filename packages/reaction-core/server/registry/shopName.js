/**
 *  ReactionRegistry.setShopName
 *  @private ReactionRegistry.setShopName
 *  @param {Object} shop - shop
 *  @summary when new shop is created, set shop name if REACTION_SHOP_NAME env var exists
 *  @returns {undefined} undefined
 */
ReactionRegistry.setShopName = function (shop) {
  const Shops = ReactionCore.Collections.Shops;
  const shopName = process.env.REACTION_SHOP_NAME;

  if (shopName) {
    // if this shop name has already been used, don't use it again
    if (!!ReactionCore.Collections.Shops.findOne({
      name: shopName
    })) {
      ReactionCore.Log.info(`Default shop name ${shopName} already used`);
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
        ReactionCore.Log.error("Failed to update shop name", err);
      }
    }
  }
};
