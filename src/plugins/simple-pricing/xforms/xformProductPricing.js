export default (node) => {
  const { price } = node;

  const pricing = {
    displayPrice: price.range,
    maxPrice: price.max,
    minPrice: price.min
  };

  return pricing;
};
