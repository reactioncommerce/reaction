/**
 * @name findCatalogProductsAndVariants
 * @summary Returns products in the Catalog collection that correspond to multiple variants.
 *   This is the same as the `findProductAndVariant` query, but this is more efficient when
 *   you need to look up multiple variants at the same time.
 * @param {Object} context - App context
 * @param {Object[]} variants - An array of objects that each have `productId` and `variantId` props.
 * @returns {Array} products - An array of products, parent variant and variants in the catalog
 */
export default async function findCatalogProductsAndVariants(context, variants) {
  const { collections: { Catalog } } = context;
  const productIds = variants.map((variant) => variant.productId);

  const catalogProductItems = await Catalog.find({
    "product.productId": { $in: productIds },
    "product.isVisible": true,
    "product.isDeleted": { $ne: true },
    "isDeleted": { $ne: true }
  }).toArray();

  const catalogProductsAndVariants = catalogProductItems.map((catalogProductItem) => {
    const { product } = catalogProductItem;
    const orderedVariant = variants.find((variant) => product.productId === variant.productId);

    const { parentVariant, variant } = context.queries.findVariantInCatalogProduct(product, orderedVariant.variantId);

    return {
      catalogProductItem,
      parentVariant,
      product,
      variant
    };
  });

  return catalogProductsAndVariants;
}
