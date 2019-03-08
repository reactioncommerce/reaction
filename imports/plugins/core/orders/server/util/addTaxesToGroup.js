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

  // This will mutate `group` to add whatever tax fields the `taxes` plugin has added to the schemas.
  return context.mutations.setTaxesOnFulfillmentGroup(context, { group, commonOrder });
}
