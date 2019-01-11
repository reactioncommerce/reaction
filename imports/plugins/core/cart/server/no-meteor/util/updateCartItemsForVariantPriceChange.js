/**
 * @summary Given cart items array, a variant ID, and the prices for that variant,
 *   returns an updated cart items array. Updates `price`, `compareAtPrice`, and `subtotal`
 *   as necessary. You need not know for sure whether prices have changed since
 *   the cart items were last updated. The return object will have a `didUpdate`
 *   boolean property that you can check to see whether any changes were made.
 * @param {Object[]} items Cart items
 * @param {String} variantId ID of variant to update items for
 * @param {Object} prices Various updated price info for this variant
 * @returns {Object} { didUpdate, updatedItems }
 */
export default function updateCartItemsForVariantPriceChange(items, variantId, prices) {
  let didUpdate = false;

  const updatedItems = items.map((item) => {
    if (item.variantId !== variantId) return item;

    // If price has changed
    if (item.price.amount !== prices.price) {
      didUpdate = true;
      item.price.amount = prices.price;
      item.subtotal.amount = prices.price * item.quantity;
    }

    // If compareAt price has changed
    if (
      (prices.compareAtPrice || prices.compareAtPrice === 0) &&
      (!item.compareAtPrice || item.compareAtPrice.amount !== prices.compareAtPrice)
    ) {
      didUpdate = true;
      item.compareAtPrice = {
        amount: prices.compareAtPrice,
        currencyCode: item.price.currencyCode
      };
    }

    // If compareAt price has been cleared
    if (!prices.compareAtPrice && prices.compareAtPrice !== 0 && item.compareAtPrice) {
      didUpdate = true;
      item.compareAtPrice = null;
    }

    return item;
  });

  return { didUpdate, updatedItems };
}
