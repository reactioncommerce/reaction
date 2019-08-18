/**
 * @name OrderFulfillmentGroup/fulfillmentGroupDisplayStatus
 * @method
 * @memberof Order/GraphQL
 * @summary Displays a human readable status of order fulfillment group state
 * @param {Object} context An object with request-specific state
 * @param {Object} fulfillmentGroup - Result of the parent resolver, which is a Fulfillment Group object in GraphQL schema format
 * @param {String} language Language to filter item content by
 * @returns {String} A string of the order status
 */
export default async function fulfillmentGroupDisplayStatus(context, fulfillmentGroup, language) {
  const { Shops } = context.collections;
  const shop = await Shops.findOne({ _id: fulfillmentGroup.shopId });
  const orderStatusLabels = shop && shop.orderStatusLabels;
  const { workflow: { status } } = fulfillmentGroup;

  // If translations are available in the `Shops` collection,
  // and are available for this specific order status, get translations
  if (orderStatusLabels && orderStatusLabels[status]) {
    const orderStatusLabel = orderStatusLabels[status];
    const translatedLabel = orderStatusLabel.find((label) => label.language === language);

    // If translations are available in desired language, return them.
    // Otherwise, return raw status
    return (translatedLabel && translatedLabel.label) || status;
  }

  // If no translations are available in the `Shops` collection, use raw status data
  return status;
}
