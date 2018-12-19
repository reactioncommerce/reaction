/**
 *
 * @method getVariantInventoryNotAvailableToSellQuantity
 * @summary Get the number of product variants that are currently reserved in an order.
 * This function can take any variant object.
 * @param {Object} variant - A product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @return {Promise<number>} Reserved variant quantity.
 */
export default async function getVariantInventoryNotAvailableToSellQuantity(variant, collections) {
  // Find orders that are new or processing
  const orders = await collections.Orders.find({
    "workflow.status": { $in: ["new", "coreOrderWorkflow/processing"] }
  }).toArray();

  const reservedQuantity = orders.reduce((sum, order) => {
    // Reduce through each fulfillment (shipping) object
    const shippingGroupsItems = order.shipping.reduce((acc, shippingGroup) => {
      // Get all items in order that match the item being adjusted
      const matchingItems = shippingGroup.items.filter((item) => item.variantId === variant._id);

      // Reduce `quantity` fields of matched items into single number
      const reservedQuantityOfItem = matchingItems.reduce((quantity, matchingItem) => quantity + matchingItem.quantity, 0);

      return acc + reservedQuantityOfItem;
    }, 0);

    // Sum up numbers from all fulfillment (shipping) groups
    return sum + shippingGroupsItems;
  }, 0);

  return reservedQuantity;
}
