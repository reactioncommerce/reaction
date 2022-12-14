import _ from "lodash";
import applyPromotions from "../handlers/applyPromotions.js";


/**
 * @summary check if the cart promotion state has changed
 * @param {Object} context - The application context
 * @param {Object} Carts - The carts collection from the context
 * @param {String} cartId - The id of the cart to check
 * @return {Promise<{reason: null, updated: boolean, cart: *}|{reason: string, updated: boolean, cart: *}>} - Whether its changed and how
 */
export async function checkForChangedCart(context, Carts, cartId) {
  let updated = false;
  let reason = null;
  // eslint-disable-next-line no-await-in-loop
  const cart = await Carts.findOne({ _id: cartId });
  // eslint-disable-next-line no-await-in-loop
  const updatedCart = await applyPromotions(context, cart);
  if (cart.appliedPromotions || updatedCart.appliedPromotions) {
    if (!updatedCart.appliedPromotions) updatedCart.appliedPromotions = [];
    if (!cart.appliedPromotions) cart.appliedPromotions = [];
    if (cart.appliedPromotions.length !== updatedCart.appliedPromotions.length) {
      updated = true;
      reason = "different array lengths";
    } else {
      // length didn't change so now we need to check each item
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
  async function saveListOfCarts(arrayOfCartIds) {
    const { collections: { Carts } } = context;
    for (const cartId of arrayOfCartIds) {
      // eslint-disable-next-line no-await-in-loop
      const { updated, cart } = await checkForChangedCart(Carts, cartId, context);
      if (updated) { // something about promotions on the cart have changed so trigger a full update
        context.mutations.saveCart(context, cart);
      }
    }
  }
  return saveListOfCarts;
}
