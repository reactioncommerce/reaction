export default function getItemDiscountTotal(context, cart) {
  let totalItemDiscount = 0;
  for (const item of cart.items) {
    const originalPrice = item.quantity * item.price.amount;
    const actualPrice = item.subtotal.amount;
    totalItemDiscount += (originalPrice - actualPrice);
  }
  return totalItemDiscount;
}
