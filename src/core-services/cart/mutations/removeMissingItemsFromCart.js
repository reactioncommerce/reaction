/**
 * @method removeMissingItemsFromCart
 * @summary Checks a cart to see if any of the items in it correspond with
 *   product variants that are now gone (hidden or deleted). Updates the
 *   cart to move them to `missingItems` array and remove them from
 *   `items`. Mutates `cart` but doesn't save to database.
 * @param {Object} context - App context
 * @param {Object} cart The Cart object to check
 * @returns {Promise<undefined>} Nothing. Mutates `cart` object
 */
export default async function removeMissingItemsFromCart(context, cart) {
  const catalogItemIds = cart.items.map((item) => item.productId);
  const catalogItems = await context.collections.Catalog.find({
    "product.productId": { $in: catalogItemIds },
    "product.isDeleted": { $ne: true },
    "product.isVisible": true
  }).toArray();

  // If any items were missing from the catalog, deleted, or hidden, move them into
  // a missingItems array. A product variant that has been hidden or deleted since
  // being added to a cart is no longer valid as a cart item.
  const items = [];
  const missingItems = [];
  for (const item of cart.items) {
    const catalogItem = catalogItems.find((cItem) => cItem.product.productId === item.productId);
    if (!catalogItem) {
      missingItems.push(item);
      continue;
    }
    const { variant: catalogVariant } = context.queries.findVariantInCatalogProduct(catalogItem.product, item.variantId);
    if (!catalogVariant) {
      missingItems.push(item);
      continue;
    }
    items.push(item);
  }

  if (missingItems.length === 0) return;

  cart.items = items;
  cart.missingItems = missingItems;
  cart.updatedAt = new Date();

  // Usually `mutations.transformAndValidateCart` removes missing items from groups
  // whenever we save a cart, but sometimes this mutation will need to be called
  // when initially reading a cart, before attempting to transform it to a CommonOrder.
  // So we'll also update the groups here.
  cart.shipping.forEach((group) => {
    group.itemIds = (group.itemIds || []).filter((itemId) => !!items.find((item) => item._id === itemId));
  });
}
