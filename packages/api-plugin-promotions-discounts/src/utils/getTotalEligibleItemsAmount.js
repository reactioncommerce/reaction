/**
 * @summary Calculate the total discount amount for an order
 * @param {Array<Object>} items - The eligible items to calculate the discount for
 * @returns {Number} The total discount amount
 */
export default function calculateEligibleItemsTotal(items) {
  const itemsTotal = items.reduce(
    (previousValue, currentValue) => previousValue + currentValue.subtotal.amount * currentValue.quantity,
    0
  );
  return itemsTotal;
}
