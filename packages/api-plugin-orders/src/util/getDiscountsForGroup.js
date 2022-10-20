import xformOrderGroupToCommonOrder from "./xformOrderGroupToCommonOrder.js";

/**
 * @summary Gets discount information for a fulfillment group
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
export default async function getDiscountsForGroup(context, {
  accountId,
  billingAddress,
  cartId,
  currencyCode,
  discountTotal,
  group,
  orderId
}) {
  const { collections, getFunctionsOfType } = context;
  const groupDiscounts = [];
  const groupDiscountTotal = discountTotal;

  return {
    groupDiscounts,
    groupDiscountTotal
  };
}
