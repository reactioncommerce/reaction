import accounting from "accounting-js";

function calculateMerchandiseTotal(cart) {
  const itemsTotal = cart.items.reduce((previousValue, currentValue) => previousValue + currentValue.subtotal.amount, 0);
  return itemsTotal;
}

export default function getCartDiscountTotal(context, cart) {
  const { promotions: { methods } } = context;
  let totalDiscountAmount = 0;
  const merchandiseTotal = calculateMerchandiseTotal(cart);
  for (const thisDiscount of cart.discounts) {
    const appliedDiscount = methods[thisDiscount.discountCalculationType](thisDiscount.discountValue, merchandiseTotal);
    totalDiscountAmount += appliedDiscount;
  }
  return Number(accounting.toFixed(totalDiscountAmount, 3));
}
