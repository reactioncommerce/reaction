import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Given a product and variant ID, looks up the product in the Catalog and
 *   returns the catalog item, catalog product, parent catalog variant (if any),
 *   and catalog variant objects.
 * @param {Object} context - App context
 * @param {String} productId The Products collections ID for the product
 * @param {String} variantId The Products collections ID for the variant of this product
 * @returns {Object} { catalogProductItem, catalogProduct, parentVariant, variant }
 */
export default async function findProductAndVariant(context, productId, variantId) {
  const { collections: { Catalog }, queries } = context;

  const catalogProductItem = await Catalog.findOne({
    "product.productId": productId,
    "product.isVisible": true,
    "product.isDeleted": { $ne: true },
    "isDeleted": { $ne: true }
  });

  if (!catalogProductItem) {
    throw new ReactionError("not-found", `CatalogProduct with product ID ${productId} not found`);
  }

  const catalogProduct = catalogProductItem.product;

  const { parentVariant, variant } = queries.findVariantInCatalogProduct(catalogProduct, variantId);
  if (!variant) {
    throw new ReactionError("invalid-param", `Product with ID ${productId} has no variant with ID ${variantId}`);
  }

  return { catalogProductItem, catalogProduct, parentVariant, variant };
}
