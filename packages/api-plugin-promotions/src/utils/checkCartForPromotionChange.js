import _ from "lodash";
import applyPromotions from "../handlers/applyPromotions.js";


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
      let updated = false;
      // eslint-disable-next-line no-await-in-loop
      const cart = await Carts.findOne({ _id: cartId });
      // eslint-disable-next-line no-await-in-loop
      const updatedCart = await applyPromotions(context, cart);
      if (cart.appliedPromotions.length !== updatedCart.appliedPromotions.length) {
        updated = true;
      } else {
        // length didn't change so now we need to check each item
        for (const promotion of cart.appliedPromotions) {
          delete promotion.updatedAt;
          const samePromotion = updatedCart.appliedPromotions.find((pid) => pid === promotion._id);
          delete samePromotion.updatedAt;
          const isEqual = _.isEqual(promotion, samePromotion);
          if (!isEqual) updated = true;
        }
      }
      if (updated) { // something about promotions on the cart have changed so trigger a full update
        context.mutations.saveCart(context, cart);
      }
    }
  }
  return saveListOfCarts;
}
