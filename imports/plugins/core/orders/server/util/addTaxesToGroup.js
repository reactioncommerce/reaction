import xformOrderGroupToCommonOrder from "/imports/plugins/core/orders/server/util/xformOrderGroupToCommonOrder";

/**
 * @summary Adds taxes to the final fulfillment group
 * @param {Object} context - an object containing the per-request state
 * @param {Object} group Fulfillment group object
 * @param {Object} orderInput - Necessary orderInput. See SimpleSchema
 * @param {String} discountTotal - Calculated discount total
 * @param {String} orderId - Randomized new orderId
 * @returns {Object} Fulfillment group object post tax addition
 */
export default async function addTaxesToGroup(context, group, orderInput, discountTotal, orderId) {
  const { collections } = context;
  const { billingAddress, cartId, currencyCode } = orderInput;

  const commonOrder = await xformOrderGroupToCommonOrder({
    billingAddress,
    cartId,
    collections,
    currencyCode,
    group,
    orderId,
    discountTotal
  });

  const { itemTaxes, taxSummary } = await context.mutations.getFulfillmentGroupTaxes(context, { order: commonOrder, forceZeroes: true });
  group.items = group.items.map((item) => {
    const itemTax = itemTaxes.find((entry) => entry.itemId === item._id) || {};

    return {
      ...item,
      tax: itemTax.tax,
      taxableAmount: itemTax.taxableAmount,
      taxes: itemTax.taxes
    };
  });
  group.taxSummary = taxSummary;
}
