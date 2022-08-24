import xformOrderGroupToCommonOrder from "./xformOrderGroupToCommonOrder.js";

/**
 * @summary Gets surcharge information for a fulfillment group
 * @param {Object} context An object containing the per-request state
 * @param {String} [accountId] ID of account that is placing or already did place the order
 * @param {Object} [billingAddress] The primary billing address for the order, if known
 * @param {String|null} [cartId] ID of the cart from which the order is being placed, if applicable
 * @param {String} currencyCode Currency code for all money values
 * @param {Number} discountTotal Calculated discount total
 * @param {Object} group The fulfillment group to be mutated
 * @param {String} orderId ID of existing or new order to which this group will belong
 * @returns {undefined}
 */
export default async function getSurchargesForGroup(context, {
  accountId,
  billingAddress,
  cartId,
  currencyCode,
  discountTotal,
  group,
  orderId
}) {
  const { collections, getFunctionsOfType } = context;

  // Get surcharges to apply to group, if applicable
  const commonOrder = await xformOrderGroupToCommonOrder({
    accountId,
    billingAddress,
    cartId,
    collections,
    currencyCode,
    group,
    orderId,
    discountTotal
  });

  const groupSurcharges = [];
  for (const func of getFunctionsOfType("getSurcharges")) {
    const appliedSurcharges = await func(context, { commonOrder }); // eslint-disable-line
    for (const appliedSurcharge of appliedSurcharges) {
      // Set fulfillmentGroupId
      appliedSurcharge.fulfillmentGroupId = group._id;
      // Push to group surcharge array
      groupSurcharges.push(appliedSurcharge);
    }
  }

  const groupSurchargeTotal = groupSurcharges.reduce((sum, surcharge) => sum + surcharge.amount, 0);

  return {
    groupSurcharges,
    groupSurchargeTotal
  };
}
