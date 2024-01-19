import Random from "@reactioncommerce/random";
import buildOrderItem from "../buildOrderItem.js";
import addInvoiceToGroup from "../addInvoiceToGroup.js";
import addShipmentMethodToGroup from "../addShipmentMethodToGroup.js";
import addTaxesToGroup from "../addTaxesToGroup.js";
import compareExpectedAndActualTotals from "../compareExpectedAndActualTotals.js";
import getSurchargesForGroup from "../getSurchargesForGroup.js";

/**
 * @summary Create fulfillment groups for a potential order
 * @param {Object} context - The application context
 * @param {Object} inputData - The input data
 * @param {String} orderId ID of existing or new order to which this group will belong
 * @param {String} [accountId] ID of account that is placing or already did place the order
 * @param {Object} [additionalItems] Additional items if any
 * @param {Object} [billingAddress] The primary billing address for the order, if known
 * @param {String} [cartId] ID of the cart from which the order is being placed, if applicable
 * @param {String} currencyCode Currency code for all money values
 * @param {Number} [discountTotal] Calculated discount total
 * @param {Object} [fulfillmentGroups] Fulfillment group input
 * @param {Object} cart Cart object
 * @returns {Promise<Object>} Object with surcharge, total, shippingAddress and finalFulfillment groups
 */
export default async function getFinalFulfillmentGroups(context, inputData) {
  const {
    orderId,
    accountId,
    additionalItems,
    billingAddress,
    cartId,
    currencyCode,
    discountTotal,
    fulfillmentGroups,
    cart
  } = inputData;

  // Create array for surcharges to apply to order, if applicable
  // Array is populated inside `fulfillmentGroups.map()`
  const orderSurcharges = [];
  let shippingAddressForPayments = null;
  let orderTotal = 0;

  // Add more props to each fulfillment group, and validate/build the items in each group

  const finalFulfillmentGroups = await Promise.all(fulfillmentGroups.map(async (inputGroup) => {
    const { data, items, selectedFulfillmentMethodId, shopId, totalPrice: expectedGroupTotal, type } = inputGroup;
    const group = {
      _id: Random.id(),
      address: data ? data.shippingAddress : null,
      shopId,
      type,
      workflow: { status: "new", workflow: ["new"] }
    };

    // Build the final order item objects. As part of this, we look up the variant in the system and make sure that
    // the price is what the caller expects it to be.
    group.items = await Promise.all((items || []).map((inputItem) => buildOrderItem(context, { currencyCode, inputItem, cart })));
    group.items.push(...(additionalItems || []));

    // Add some more properties for convenience
    group.itemIds = group.items.map((item) => item._id);
    group.totalItemQuantity = group.items.reduce((sum, item) => sum + item.quantity, 0);

    if (cart && Array.isArray(cart.shipping)) {
      const cartShipping = cart.shipping.find((shipping) => shipping.shipmentMethod?._id === selectedFulfillmentMethodId);
      group.shipmentMethod = cartShipping?.shipmentMethod;
    }

    // Apply shipment method
    group.shipmentMethod = await addShipmentMethodToGroup(context, {
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
    group.invoice = addInvoiceToGroup({
      currencyCode,
      group,
      groupDiscountTotal: discountTotal,
      groupSurchargeTotal,
      taxableAmount,
      taxTotal
    });

    if (expectedGroupTotal) {
      // Compare expected and actual totals to make sure client sees correct calculated price
      // Error if we calculate total price differently from what the client has shown as the preview.
      // It's important to keep this after adding and verifying the shipmentMethod and order item prices.
      compareExpectedAndActualTotals(group.invoice.total, expectedGroupTotal);
    }

    // We save off the first shipping address found, for passing to payment services. They use this
    // for fraud detection.
    if (group.address && !shippingAddressForPayments) shippingAddressForPayments = group.address;

    // Push all group surcharges to overall order surcharge array.
    // Currently, we do not save surcharges per group
    orderSurcharges.push(...groupSurcharges);

    // Add the group total to the order total
    orderTotal += group.invoice.total;

    return group;
  }));

  return { orderSurcharges, orderTotal, shippingAddressForPayments, finalFulfillmentGroups };
}
