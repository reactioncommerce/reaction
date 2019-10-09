import xformOrderGroupToCommonOrder from "./xformOrderGroupToCommonOrder.js";

/**
 * @summary Adds taxes to a fulfillment group
 * @param {Object} context An object containing the per-request state
 * @param {String} [accountId] ID of account that is placing or already did place the order
 * @param {Object} [billingAddress] The primary billing address for the order, if known
 * @param {String|null} [cartId] ID of the cart from which the order is being placed, if applicable
 * @param {String} currencyCode Currency code for all money values
 * @param {Number} discountTotal Calculated discount total
 * @param {Object} group The fulfillment group to be mutated
 * @param {String} orderId ID of existing or new order to which this group will belong
 * @returns {Object} An object with `taxTotal` and `taxableAmount` numeric properties
 */
export default async function addTaxesToGroup(context, {
  accountId,
  billingAddress,
  cartId,
  currencyCode,
  discountTotal,
  group,
  orderId
}) {
  const { collections, mutations } = context;

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

  // A taxes plugin is expected to add a mutation named `setTaxesOnOrderFulfillmentGroup`.
  // If this isn't done, assume 0 tax.
  if (typeof mutations.setTaxesOnOrderFulfillmentGroup !== "function") {
    return { taxTotal: 0, taxableAmount: 0 };
  }

  // This will mutate `group` to add whatever tax fields the `taxes` plugin has added to the schemas.
  return mutations.setTaxesOnOrderFulfillmentGroup(context, { group, commonOrder });
}
