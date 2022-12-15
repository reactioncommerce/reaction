import { createRequire } from "module";
import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import applyPromotions from "../handlers/applyPromotions.js";


const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "checkCartForPromotionChange.js"
};


/**
 * @summary check if the cart promotion state has changed
 * @param {Object} context - The application context
 * @param {Object} Cart - The carts collection from the context
 * @param {String} cartId - The id of the cart to check
 * @return {Promise<{reason: null, updated: boolean, cart: *}|{reason: string, updated: boolean, cart: *}>} - Whether its changed and how
 */
export async function checkForChangedCart(context, Cart, cartId) {
  let updated = false;
  let reason = null;
  // eslint-disable-next-line no-await-in-loop
  const cart = await Cart.findOne({ _id: cartId });
  // eslint-disable-next-line no-await-in-loop
  const cartToMutate = _.cloneDeep(cart); // can't pass in cart since applyPromotion mutates
  const updatedCart = await applyPromotions(context, cartToMutate);
  if (cart.appliedPromotions || updatedCart.appliedPromotions) {
    if (!updatedCart.appliedPromotions) updatedCart.appliedPromotions = [];
    if (!cart.appliedPromotions) cart.appliedPromotions = [];
    if (cart.appliedPromotions.length !== updatedCart.appliedPromotions.length) {
      updated = true;
      reason = "different number of promotions";
    } else {
      // length didn't change, so now we need to check each item
      for (const promotion of cart.appliedPromotions) {
        delete promotion.updatedAt;
        const samePromotion = updatedCart.appliedPromotions.find((pr) => pr._id === promotion._id);
        if (!samePromotion) {
          updated = true; reason = "new or missing promotion";
          return { updated, reason, cart };
        }
        delete samePromotion.updatedAt;
        const isEqual = _.isEqual(promotion, samePromotion);
        if (!isEqual) {
          updated = true;
          reason = "promotions not equal";
        }
      }
    }
  }
  return { updated, reason, cart };
}

/**
 * @summary returns the saveListOfCarts function with context enclosed
 * @param {Object} context - The application context
 * @return {function} - The saveListOfCarts function
 */
export default function wrapper(context) {
  /**
   * @summary take a list of carts, fetch them and then call saveCart mutation them to recalculate promotions
   * @param {Array<String>} arrayOfCartIds - An array of cart ids
   * @return {undefined} undefined
   */
  async function checkCartsForPromotionChange(arrayOfCartIds) {
    let totalModified = 0;
    let totalUnchanged = 0;
    const { collections: { Cart } } = context;
    for (const cartId of arrayOfCartIds) {
      // eslint-disable-next-line no-await-in-loop
      const { updated, cart } = await checkForChangedCart(context, Cart, cartId);
      if (updated) { // something about promotions on the cart have changed so trigger a full update
        context.mutations.saveCart(context, cart);
        totalModified += 1;
      } else {
        totalUnchanged += 1;
      }
    }
    Logger.info(
      { totalModified, totalUnchanged, numberOfCarts: arrayOfCartIds.length, ...logCtx },
      "Completed processing batch of cart promotion checks"
    );
  }
  return checkCartsForPromotionChange;
}
