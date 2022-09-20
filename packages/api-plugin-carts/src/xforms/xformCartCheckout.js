import getRateObjectForRate from "@reactioncommerce/api-utils/getRateObjectForRate.js";

/**
 * @summary Transform a single fulfillment group
 * @param {Object} fulfillmentGroup Fulfillment group
 * @param {Object} cart Full cart document, with items already transformed
 * @returns {Object} Transformed group
 */
function xformCartFulfillmentGroup(fulfillmentGroup, cart) {
  const availableFulfillmentOptions = (fulfillmentGroup.shipmentQuotes || []).map((option) => ({
    fulfillmentMethod: {
      _id: option.method._id,
      carrier: option.method.carrier || null,
      displayName: option.method.label || option.method.name,
      group: option.method.group || null,
      name: option.method.name,
      fulfillmentTypes: option.method.fulfillmentTypes
    },
    handlingPrice: {
      amount: option.handlingPrice || 0,
      currencyCode: cart.currencyCode
    },
    shippingPrice: {
      amount: option.shippingPrice || 0,
      currencyCode: cart.currencyCode
    },
    price: {
      amount: (option.rate + option.handlingPrice) || 0,
      currencyCode: cart.currencyCode
    }
  }));

  let selectedFulfillmentOption = null;
  if (fulfillmentGroup.shipmentMethod) {
    selectedFulfillmentOption = {
      fulfillmentMethod: {
        _id: fulfillmentGroup.shipmentMethod._id,
        carrier: fulfillmentGroup.shipmentMethod.carrier || null,
        displayName: fulfillmentGroup.shipmentMethod.label || fulfillmentGroup.shipmentMethod.name,
        group: fulfillmentGroup.shipmentMethod.group || null,
        name: fulfillmentGroup.shipmentMethod.name,
        fulfillmentTypes: fulfillmentGroup.shipmentMethod.fulfillmentTypes
      },
      handlingPrice: {
        amount: fulfillmentGroup.shipmentMethod.handling || 0,
        currencyCode: cart.currencyCode
      },
      price: {
        amount: (fulfillmentGroup.shipmentMethod.rate + fulfillmentGroup.shipmentMethod.handling) || 0,
        currencyCode: cart.currencyCode
      }
    };
  }

  return {
    _id: fulfillmentGroup._id,
    availableFulfillmentOptions,
    data: {
      shippingAddress: fulfillmentGroup.address
    },
    // For now, we only ever set one fulfillment group, so it has all of the items.
    // Revisit when the UI supports breaking into multiple groups.
    items: cart.items.filter(({ _id }) => fulfillmentGroup.itemIds.includes(_id)),
    selectedFulfillmentOption,
    shippingAddress: fulfillmentGroup.address,
    shopId: fulfillmentGroup.shopId,
    // For now, this is always shipping. Revisit when adding download, pickup, etc. types
    type: "shipping"
  };
}

/**
 * @param {Object} collections Map of Mongo collections
 * @param {Object} cart Cart document
 * @returns {Object} Checkout object
 */
export default async function xformCartCheckout(collections, cart) {
  // itemTotal is qty * amount for each item, summed
  const itemTotal = (cart.items || []).reduce((sum, item) => (sum + item.subtotal.amount), 0);

  // shippingTotal is shipmentMethod.rate for each item, summed
  // handlingTotal is shipmentMethod.handling for each item, summed
  // If there are no selected shipping methods, fulfillmentTotal should be null
  let fulfillmentGroups = cart.shipping || [];
  let fulfillmentTotal = null;
  if (fulfillmentGroups.length > 0) {
    let shippingTotal = 0;
    let handlingTotal = 0;

    let hasNoSelectedShipmentMethods = true;
    fulfillmentGroups.forEach((fulfillmentGroup) => {
      if (fulfillmentGroup.shipmentMethod) {
        hasNoSelectedShipmentMethods = false;
        shippingTotal += fulfillmentGroup.shipmentMethod.rate || 0;
        handlingTotal += fulfillmentGroup.shipmentMethod.handling || 0;
      }
    });

    if (!hasNoSelectedShipmentMethods) {
      fulfillmentTotal = shippingTotal + handlingTotal;
    }
  }

  // Each item may have a total tax amount on it. We can sum these to get the total tax amount.
  // If any of them are null, we leave the total null also. Using for-of rather than reduce
  // so that we can set to null and break if we hit a not-yet-calculated item.
  let taxTotal = null;
  let taxableAmount = null;
  const { taxSummary } = cart;
  if (taxSummary) {
    ({ tax: taxTotal, taxableAmount } = taxSummary);
  }

  const discountTotal = cart.discount || 0;

  // surchargeTotal is sum of all surcharges is qty * amount for each item, summed
  const surchargeTotal = (cart.surcharges || []).reduce((sum, surcharge) => (sum + surcharge.amount), 0);

  const total = Math.max(0, itemTotal + fulfillmentTotal + taxTotal + surchargeTotal - discountTotal);

  let fulfillmentTotalMoneyObject = null;
  if (fulfillmentTotal !== null) {
    fulfillmentTotalMoneyObject = {
      amount: fulfillmentTotal,
      currencyCode: cart.currencyCode
    };
  }

  let taxTotalMoneyObject = null;
  let effectiveTaxRateObject = null;
  if (taxTotal !== null) {
    taxTotalMoneyObject = {
      amount: taxTotal,
      currencyCode: cart.currencyCode
    };
    if (taxSummary) {
      const effectiveTaxRate = taxSummary.tax / taxSummary.taxableAmount;
      effectiveTaxRateObject = getRateObjectForRate(effectiveTaxRate);
    }
  }

  fulfillmentGroups = fulfillmentGroups.map((fulfillmentGroup) => xformCartFulfillmentGroup(fulfillmentGroup, cart));
  fulfillmentGroups = fulfillmentGroups.filter((group) => !!group); // filter out nulls

  return {
    fulfillmentGroups,
    summary: {
      discountTotal: {
        amount: discountTotal,
        currencyCode: cart.currencyCode
      },
      effectiveTaxRate: effectiveTaxRateObject,
      fulfillmentTotal: fulfillmentTotalMoneyObject,
      itemTotal: {
        amount: itemTotal,
        currencyCode: cart.currencyCode
      },
      taxableAmount: {
        amount: taxableAmount,
        currencyCode: cart.currencyCode
      },
      taxTotal: taxTotalMoneyObject,
      surchargeTotal: {
        amount: surchargeTotal,
        currencyCode: cart.currencyCode
      },
      total: {
        amount: total,
        currencyCode: cart.currencyCode
      }
    }
  };
}
