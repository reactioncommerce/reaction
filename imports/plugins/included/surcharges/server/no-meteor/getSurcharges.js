import Random from "@reactioncommerce/random";
import xformCartGroupToCommonOrder from "/imports/plugins/core/cart/server/no-meteor/util/xformCartGroupToCommonOrder";
import extendCommonOrder from "/imports/plugins/core/shipping/server/no-meteor/util/extendCommonOrder";
import { surchargeCheck } from "./util/surchargeCheck";


/**
 * @summary Returns a list of surcharges to apply based on the cart.
 * @param {Object} context - Context
 * @param {Object} cart - the user's cart
 * @return {Array} - an array that surcharges to apply to cart / order
 * @private
 */
export default async function getSurcharges(context, { cart }) {
  const { Surcharges } = context.collections;
  const surcharges = await Surcharges.find({}).toArray();

  // Create an extended common order to check surcharges against
  const commonOrder = await xformCartGroupToCommonOrder(cart, cart.shipping[0], context); // TODO: EK - pass correct shipping object
  const extendedCommonOrder = await extendCommonOrder(context, commonOrder);

  const allAppliedSurcharges = await surcharges.reduce(async (appliedSurcharges, surcharge) => {
    const awaitedAppliedSurcharges = await appliedSurcharges;

    const applySurcharge = await surchargeCheck(surcharge, extendedCommonOrder);

    // If surcharge passes all checks, it is valid and should be added to valid surcharges array
    if (applySurcharge) {
      awaitedAppliedSurcharges.push(surcharge);
    }

    return awaitedAppliedSurcharges;
  }, Promise.resolve([]));

  // We don't need all data to be passed to Cart / Order
  // Parse provided surcharge data to pass only relevent data to match Cart / Order schema
  const appliedSurchargesFormattedForFulfillment = allAppliedSurcharges.map((surcharge) => {
    return {
      _id: Random.id(),
      surchargeId: surcharge._id,
      amount: surcharge.amount,
      message: surcharge.message,
      cartId: cart._id
    };
  });

  return appliedSurchargesFormattedForFulfillment;
}
