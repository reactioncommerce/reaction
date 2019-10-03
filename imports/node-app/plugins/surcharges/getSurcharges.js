import Random from "@reactioncommerce/random";
import extendCommonOrder from "/imports/node-app/core-services/shipping/util/extendCommonOrder"; // TODO: remove cross-plugin import (https://github.com/reactioncommerce/reaction/issues/5633)
import { surchargeCheck } from "./util/surchargeCheck.js";


/**
 * @summary Returns a list of surcharges to apply based on the cart.
 * @param {Object} context - Context
 * @param {Object} input - Additional input
 * @param {Object} input.commonOrder - CommonOrder
 * @returns {Array} - an array that surcharges to apply to cart / order
 * @private
 */
export default async function getSurcharges(context, { commonOrder }) {
  const { collections: { Surcharges } } = context;

  // Get surcharges from Mongo
  // Use forEach to use Mongos built in memory handling to not
  // overload memory while fetching the entire collection
  const surcharges = [];
  await Surcharges.find({ shopId: commonOrder.shopId }).forEach((surcharge) => {
    surcharges.push(surcharge);
  });

  if (surcharges.length === 0) return [];

  // Keep this after the early exit since this hits the DB a bunch and isn't needed
  // when there are no surcharges defined.
  const extendedCommonOrder = await extendCommonOrder(context, commonOrder);

  const allAppliedSurcharges = await surcharges.reduce(async (appliedSurcharges, surcharge) => {
    const awaitedAppliedSurcharges = await appliedSurcharges;

    const { methodIds } = surcharge;
    const { fulfillmentMethodId } = extendedCommonOrder;

    // Check to see if surcharge has methodIds attached to it.
    // If it doesn't, this surcharge can apply to any fulfillmentMethod
    if (Array.isArray(methodIds) && methodIds.length > 0) {
      // If surcharge has methodIds attached to it, and fulfillmentMethodId is not yet set,
      // don't apply any surcharges at this time
      if (!fulfillmentMethodId) return awaitedAppliedSurcharges;

      // If surcharge has methodIds attached to it, and fulfillmentMethodId is set,
      // check to see if surcharge applies to this methodId.
      // If not, don't apply surcharge.
      if (!methodIds.includes(fulfillmentMethodId)) return awaitedAppliedSurcharges;
    }

    const applySurcharge = await surchargeCheck(surcharge, extendedCommonOrder);

    // If surcharge passes all checks, it is valid and should be added to valid surcharges array
    if (applySurcharge) {
      awaitedAppliedSurcharges.push(surcharge);
    }

    return awaitedAppliedSurcharges;
  }, Promise.resolve([]));

  // We don't need all data to be passed to Cart / Order
  // Parse provided surcharge data to pass only relevant data to match Cart / Order schema
  const appliedSurchargesFormattedForFulfillment = allAppliedSurcharges.map((surcharge) => ({
    _id: Random.id(),
    surchargeId: surcharge._id,
    amount: surcharge.amount,
    messagesByLanguage: surcharge.messagesByLanguage,
    cartId: commonOrder.cartId
  }));

  return appliedSurchargesFormattedForFulfillment;
}
