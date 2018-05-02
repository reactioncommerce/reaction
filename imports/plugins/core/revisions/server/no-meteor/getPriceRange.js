export default function getPriceRange(prices) {
  if (prices.length === 1) {
    return {
      range: prices[0].toFixed(2),
      min: prices[0],
      max: prices[0]
    };
  }

  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = Number.NEGATIVE_INFINITY;

  prices.forEach((price) => {
    if (price < priceMin) {
      priceMin = price;
    }
    if (price > priceMax) {
      priceMax = price;
    }
  });

  if (priceMin === priceMax) {
    // TODO check impact on i18n/formatPrice from moving return to string
    return {
      range: priceMin.toFixed(2),
      min: priceMin,
      max: priceMax
    };
  }
  return {
    range: `${priceMin.toFixed(2)} - ${priceMax.toFixed(2)}`,
    min: priceMin,
    max: priceMax
  };
}
