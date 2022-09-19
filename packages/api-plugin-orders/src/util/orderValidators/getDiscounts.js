export default async function getDiscounts(context, cart) {
  let discounts = [];
  let discountTotal = 0;
  if (cart) {
    const discountsResult = await context.queries.getDiscountsTotalForCart(context, cart);
    ({ discounts } = discountsResult);
    discountTotal = discountsResult.total;
  }
  return { discounts, discountTotal };
}