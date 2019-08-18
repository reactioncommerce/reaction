/**
 * @summary Mutates a new top-level Product being created
 * @param {Object} product Product object to mutate
 * @returns {undefined}
 */
export default function mutateNewProductBeforeCreate(product) {
  if (!product.price) {
    product.price = {
      range: "0.00 - 0.00",
      min: 0,
      max: 0
    };
  }
}
