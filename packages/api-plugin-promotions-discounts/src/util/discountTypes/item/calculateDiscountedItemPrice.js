export default function calculateDiscountedItemPrice(context, { price, quantity, discounts }) {
  let totalDiscount = 0;
  const amountBeforeDiscounts = price * quantity;
  discounts.forEach((discount) => {
    const calculationMethod = context.promotions.methods[discount.discountCalculationType];
    const discountAmount = calculationMethod(discount.discountValue, amountBeforeDiscounts);
    totalDiscount += discountAmount;
  });
  if (totalDiscount < amountBeforeDiscounts) {
    return amountBeforeDiscounts - totalDiscount;
  }
  return 0;
}
