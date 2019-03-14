/**
 * @summary Optionally mutates a new OrderItem before it is added to an order
 * @param {Object} context App context
 * @param {Object} chosenProduct The product being ordered
 * @param {Object} chosenVariant The product variant being ordered
 * @param {Object} item The OrderItem so far. Potentially mutates this to add additional properties.
 * @returns {undefined}
 */
export default function mutateNewOrderItemBeforeCreate(context, { chosenVariant, item }) {
  item.isTaxable = !!(chosenVariant && chosenVariant.isTaxable);
  item.taxCode = chosenVariant.taxCode || null;
}
