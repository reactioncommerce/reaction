function percentage(discountValue, price) {
  return price * (discountValue / 100);
}

function flat(discountValue) {
  return discountValue;
}

function fixed(discountValue, price) {
  const amountToDiscount = Math.abs(discountValue - price);
  return amountToDiscount;
}

export default {
  percentage,
  flat,
  fixed
};
