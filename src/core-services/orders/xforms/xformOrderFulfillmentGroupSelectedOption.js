/**
 * @summary Transform a single fulfillment group fulfillment option
 * @param {Object} fulfillmentOption The group.shipmentMethod
 * @returns {Object} Transformed fulfillment option
 */
export default function xformOrderFulfillmentGroupSelectedOption(fulfillmentOption) {
  return {
    fulfillmentMethod: {
      _id: fulfillmentOption._id,
      carrier: fulfillmentOption.carrier || null,
      displayName: fulfillmentOption.label || fulfillmentOption.name,
      group: fulfillmentOption.group || null,
      name: fulfillmentOption.name,
      // For now, this is always shipping. Revisit when adding download, pickup, etc. types
      fulfillmentTypes: ["shipping"]
    },
    handlingPrice: {
      amount: fulfillmentOption.handling || 0,
      currencyCode: fulfillmentOption.currencyCode
    },
    price: {
      amount: fulfillmentOption.rate || 0,
      currencyCode: fulfillmentOption.currencyCode
    }
  };
}
