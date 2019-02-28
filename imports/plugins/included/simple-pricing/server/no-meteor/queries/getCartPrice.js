/**
 * @method getCartPrice
 * @summary This method returns the applicable price and currency code for a selected product.
 * @param {Object} chosenVariant - A selected product variant.
 * @param {Object} providedPrice - A product variant price provided form the client.
 * @return {Object} - A cart item price value.
 */
export default function getCartPrice(chosenVariant, providedPrice) {
  return chosenVariant.pricing[providedPrice.currencyCode];
}
