/**
 * @summary Calculate the total discount amount for an order
 * @param {Object} cart - The cart to calculate the discount for
 * @returns {Number} The total discount amount
 */
export function calculateMerchandiseTotal(cart) {
  const itemsTotal = cart.items.reduce(
    (previousValue, currentValue) => previousValue + currentValue.price.amount * currentValue.quantity,
    0
  );
  return itemsTotal;
}
