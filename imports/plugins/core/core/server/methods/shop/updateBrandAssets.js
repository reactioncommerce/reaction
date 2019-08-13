import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Shops } from "/lib/collections";

/**
 * @name updateShopBrandAssets
 * @method
 * @param {Object} asset - brand asset {mediaId: "", type, ""}
 * @param {String} shopId - the shop id corresponding to the shop for which
 *                 the asset should be applied (defaults to Reaction.getShopId())
 * @param {String} userId - the user id on whose behalf we are performing this
 *                 action (defaults to logged in user ID)
 * @returns {Int} returns update result
 * @private
 */
function updateShopBrandAssets(asset, shopId = Reaction.getShopId(), userId = Reaction.getUserId()) {
  check(asset, {
    mediaId: String,
    type: String
  });
  check(shopId, String);

  // must have core permissions
  if (!Reaction.hasPermission("core", userId, shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Does our shop contain the brand asset we're trying to add
  const shopWithBrandAsset = Shops.findOne({
    "_id": shopId,
    "brandAssets.type": asset.type
  });

  // If it does, then we update it with the new asset reference
  if (shopWithBrandAsset) {
    return Shops.update({
      "_id": shopId,
      "brandAssets.type": asset.type
    }, {
      $set: {
        "brandAssets.$": {
          mediaId: asset.mediaId,
          type: asset.type
        }
      }
    });
  }

  // Otherwise we insert a new brand asset reference
  return Shops.update({
    _id: shopId
  }, {
    $push: {
      brandAssets: {
        mediaId: asset.mediaId,
        type: asset.type
      }
    }
  });
}

/**
 * @name shop/updateBrandAssets
 * @method
 * @memberof Shop/Methods
 * @param {Object} asset - brand asset {mediaId: "", type, ""}
 * @returns {Int} returns update result
 */
export default function updateBrandAssets(asset) {
  check(asset, {
    mediaId: String,
    type: String
  });

  this.unblock();

  return updateShopBrandAssets(asset);
}
