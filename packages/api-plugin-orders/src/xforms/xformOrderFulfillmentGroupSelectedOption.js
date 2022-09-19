/**
 * @summary Transform a single fulfillment group fulfillment option
 * @param {Object} fulfillmentOption The group.shipmentMethod
 * @param {Object} node The group
 * @returns {Object} Transformed fulfillment option
 */
export default function xformOrderFulfillmentGroupSelectedOption(fulfillmentOption, node) {
  let fulfillmentType = "";
  if (node && node.type) {
    fulfillmentType = node.type;
  }

  return {
    fulfillmentMethod: {
      _id: fulfillmentOption._id,
      carrier: fulfillmentOption.carrier || null,
      displayName: fulfillmentOption.label || fulfillmentOption.name,
      group: fulfillmentOption.group || null,
      name: fulfillmentOption.name,
      // For now, this is always shipping. Revisit when adding download, pickup, etc. types - done
      // fulfillmentTypes: ["shipping"]
      fulfillmentTypes: [fulfillmentType],
      methodAdditionalData: fulfillmentOption.methodAdditionalData || { gqlType: "emptyData", emptyData: false }
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
