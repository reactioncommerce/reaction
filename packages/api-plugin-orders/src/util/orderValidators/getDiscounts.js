/**
 * @method getDiscounts
 * @summary Returns the Discount Total for cart
 * @param {Object} context - an object containing the per-request state
 * @param {Object} cart - cart object
 * @returns {Object} discounts and discountTotal
 */
export default async function getDiscounts(context, cart) {
  let discounts = [];
  let discountTotal = 0;
  if (cart) {
    const discountsResult = await context.queries.getDiscountsTotalForCart(context, cart);
    if (discountsResult) {
      ({ discounts } = discountsResult);
      discountTotal = discountsResult.total;
    }
  }
  return { discounts, discountTotal };
}
