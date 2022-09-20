/**
 * @name Order/orderDisplayStatus
 * @method
 * @memberof Order/GraphQL
 * @summary Displays a human readable status of order state
 * @param {Object} context An object with request-specific state
 * @param {Object} order - Result of the parent resolver, which is a Order object in GraphQL schema format
 * @param {String} language Language to filter item content by
 * @returns {String} A string of the order status
 */
export default async function orderDisplayStatus(context, order, language) {
  const { Shops } = context.collections;
  const shop = await Shops.findOne({ _id: order.shopId });
  const orderStatusLabels = shop && shop.orderStatusLabels;
  const { workflow: { status } } = order;

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
