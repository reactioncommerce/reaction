import addInvoiceToGroup from "./addInvoiceToGroup.js";
import addShipmentMethodToGroup from "./addShipmentMethodToGroup.js";
import addTaxesToGroup from "./addTaxesToGroup.js";
import compareExpectedAndActualTotals from "./compareExpectedAndActualTotals.js";
import getSurchargesForGroup from "./getSurchargesForGroup.js";

/**
 * @summary Call this with a fulfillment group when the items, item quantities, or
 *   something else relevant about the group may have changed. All shipping, tax,
 *   and surcharge values will be recalculated and invoice totals updated.
 * @param {Object} context App context
 * @param {String} [accountId] ID of account that is placing or already did place the order
 * @param {Object} [billingAddress] The primary billing address for the order, if known
 * @param {String} [cartId] ID of the cart from which the order is being placed, if applicable
 * @param {String} currencyCode Currency code for all money values
 * @param {Number} [discountTotal] Calculated discount total
 * @param {Number} [expectedGroupTotal] Expected total, if you want to verify the calculated total matches
 * @param {Object} group The fulfillment group to mutate
 * @param {String} orderId ID of existing or new order to which this group will belong
 * @param {String} selectedFulfillmentMethodId ID of the fulfillment method option chosen by the user
 * @returns {Promise<Object>} Object with surcharge and tax info on it
 */
export default async function updateGroupTotals(context, {
  accountId,
  billingAddress = null,
  cartId = null,
  currencyCode,
  discountTotal = 0,
  expectedGroupTotal,
  group,
  orderId,
  selectedFulfillmentMethodId
}) {
  // Apply shipment method
  await addShipmentMethodToGroup(context, {
    accountId,
    billingAddress,
    cartId,
    currencyCode,
    discountTotal,
    group,
    orderId,
    selectedFulfillmentMethodId
  });

  const {
    groupSurcharges,
    groupSurchargeTotal
  } = await getSurchargesForGroup(context, {
    accountId,
    billingAddress,
    cartId,
    currencyCode,
    discountTotal,
    group,
    orderId,
    selectedFulfillmentMethodId
  });

  // Calculate and set taxes. Mutates group object in addition to returning the totals.
  const { taxTotal, taxableAmount } = await addTaxesToGroup(context, {
    accountId,
    billingAddress,
    cartId,
    currencyCode,
    discountTotal,
    group,
    orderId,
    surcharges: groupSurcharges
  });

  // Build and set the group invoice
  addInvoiceToGroup({
    currencyCode,
    group,
    groupDiscountTotal: discountTotal,
    groupSurchargeTotal,
    taxableAmount,
    taxTotal
  });

  if (expectedGroupTotal) {
    // For now we expect that the client has NOT included discounts in the expected total it sent.
    // Note that we don't currently know which parts of `discountTotal` go with which fulfillment groups.
    // This needs to be rewritten soon for discounts to work when there are multiple fulfillment groups.
    // Probably the client should be sending all applied discount IDs and amounts in the order input (by group),
    // and include total discount in `groupInput.totalPrice`, and then we simply verify that they are valid here.
    const expectedTotal = Math.max(expectedGroupTotal - discountTotal, 0);

    // Compare expected and actual totals to make sure client sees correct calculated price
    // Error if we calculate total price differently from what the client has shown as the preview.
    // It's important to keep this after adding and verifying the shipmentMethod and order item prices.
    compareExpectedAndActualTotals(group.invoice.total, expectedTotal);
  }

  return {
    groupSurcharges,
    groupSurchargeTotal,
    taxableAmount,
    taxTotal
  };
}
