import getCatalogProductMedia from "./getCatalogProductMedia.js";

/**
 * @name publishProductToCatalogMedia
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms a CatalogProduct before saving it
 * @param {Object} catalogProduct CatalogProduct object to potentially mutate
 * @param {Object} info Additional info
 * @param {Object} info.context App context
 * @returns {Promise<undefined>} Mutates `catalogProduct` but does not return anything
 */
export default async function publishProductToCatalogMedia(catalogProduct, { context }) {
  const catalogProductMedia = await getCatalogProductMedia(catalogProduct.productId, context.collections);

  catalogProduct.media = catalogProductMedia;
  catalogProduct.primaryImage = catalogProductMedia[0] || null;

  for (const catalogProductVariant of catalogProduct.variants) {
    const variantMedia = catalogProductMedia.filter((media) => media.variantId === catalogProductVariant.variantId);
    catalogProductVariant.media = variantMedia;
    catalogProductVariant.primaryImage = variantMedia[0] || null;

    if (catalogProductVariant.options) {
      for (const catalogProductOption of catalogProductVariant.options) {
        const optionMedia = catalogProductMedia.filter((media) => media.variantId === catalogProductOption.variantId);
        catalogProductVariant.media = optionMedia;
        catalogProductVariant.primaryImage = optionMedia[0] || null;
      }
    }
  }
}
