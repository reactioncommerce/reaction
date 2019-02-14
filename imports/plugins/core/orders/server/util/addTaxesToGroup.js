import xformOrderGroupToCommonOrder from "/imports/plugins/core/orders/server/util/xformOrderGroupToCommonOrder";

/**
 * @summary Adds taxes to the final fulfillment group
 * @param {Object} context - an object containing the per-request state
 * @param {Object} finalGroup Fulfillment group object pre shipment method addition
 * @param {Object} cleanedInput - Necessary orderInput. See SimpleSchema
 * @param {Object} groupInput - Original fulfillment group that we compose finalGroup from. See SimpleSchema
 * @param {String} discountTotal - Calculated discount total
 * @param {String} orderId - Randomized new orderId
 * @returns {Object} Fulfillment group object post tax addition
 */
export default async function addTaxesToGroup(context, finalGroup, cleanedInput, groupInput, discountTotal, orderId) {
  const { collections } = context;
  const { order: orderInput } = cleanedInput;
  const { billingAddress, cartId, currencyCode } = orderInput;

  const commonOrder = await xformOrderGroupToCommonOrder({
    billingAddress,
    cartId,
    collections,
    currencyCode,
    group: finalGroup,
    orderId,
    discountTotal
  });

  const { itemTaxes, taxSummary } = await context.mutations.getFulfillmentGroupTaxes(context, { order: commonOrder, forceZeroes: true });
  finalGroup.items = finalGroup.items.map((item) => {
    const itemTax = itemTaxes.find((entry) => entry.itemId === item._id) || {};

    return {
      ...item,
      tax: itemTax.tax,
      taxableAmount: itemTax.taxableAmount,
      taxes: itemTax.taxes
    };
  });
  finalGroup.taxSummary = taxSummary;
}
