import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import pkg from "../../package.json" assert { type: "json" };
import applyPromotions from "../handlers/applyPromotions.js";


const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "checkCartForPromotionChange.js"
};

/**
 * @summary normalize promotions arrays for comparison
 * @param {Array<{Object}>} promotions - The array of promotions to normalize
 * @return {Array<{Object}>} - Normalized array of promotions
 */
function normalizePromotions(promotions) {
  _.chain(promotions).sortBy("_id").map((promotion) => _.omit(promotion, "updatedAt")).value();
  return promotions;
}

/**
 * @summary check if the cart promotion state has changed
 * @param {Object} context - The application context
 * @param {Object} Cart - The carts collection from the context
 * @param {String} cartId - The id of the cart to check
 * @return {Promise<Object>} - Whether its changed, and the updated cart
 */
export async function hasChanged(context, Cart, cartId) {
  const cart = await Cart.findOne({ _id: cartId });
  const originalCartClone = _.cloneDeep(cart);
  const cartToMutate = _.cloneDeep(cart); // can't pass in cart since applyPromotion mutates
  const updatedCart = await applyPromotions(context, cartToMutate);
  updatedCart.appliedPromotions = normalizePromotions(updatedCart.appliedPromotions);
  originalCartClone.appliedPromotions = normalizePromotions(cart.appliedPromotions);
  const updated = !_.isEqual(originalCartClone.appliedPromotions, updatedCart.appliedPromotions);
  return { updated, cart };
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
      const { updated, cart } = await hasChanged(context, Cart, cartId);
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
