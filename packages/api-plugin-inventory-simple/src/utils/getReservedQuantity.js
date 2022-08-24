import orderIsApproved from "./orderIsApproved.js";

/**
 *
 * @method getReservedQuantity
 * @summary Get the number of product variants that are currently reserved in an order.
 * This function can take any variant object.
 * @param {Object} context App context
 * @param {Object} productConfiguration Product configuration
 * @returns {Promise<Number>} Reserved variant quantity
 */
export default async function getReservedQuantity(context, productConfiguration) {
  const { productVariantId } = productConfiguration;

  // Find orders that are new or processing
  const orders = await context.collections.Orders.find({
    "workflow.status": { $in: ["new", "coreOrderWorkflow/processing"] },
    "shipping.items.variantId": productVariantId
  }).toArray();

  const reservedQuantity = orders.reduce((sum, order) => {
    if (orderIsApproved(order)) return sum;

    // Reduce through each fulfillment (shipping) object
    const shippingGroupsItems = order.shipping.reduce((acc, shippingGroup) => {
      // Get all items in order that match the item being adjusted
      const matchingItems = shippingGroup.items.filter((item) => item.variantId === productVariantId);

      // Reduce `quantity` fields of matched items into single number
      const reservedQuantityOfItem = matchingItems.reduce((quantity, matchingItem) => quantity + matchingItem.quantity, 0);

      return acc + reservedQuantityOfItem;
    }, 0);

    // Sum up numbers from all fulfillment (shipping) groups
    return sum + shippingGroupsItems;
  }, 0);

  return reservedQuantity;
}
