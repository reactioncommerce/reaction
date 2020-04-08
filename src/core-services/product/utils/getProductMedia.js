/**
 *
 * @method getProductMedia
 * @summary Get an array of ImageInfo objects by Product ID
 * @param {Object} product -  A product of type simple
 * @param {Boolean} shouldIncludeVariantMedia - Whether to return variant media or not
 * @param {Object} context - The per request context
 * @returns {Promise<Object[]>} Array of ImageInfo objects sorted by priority
 */
export default async function getProductMedia(product, { shouldIncludeVariantMedia = true }, context) {
  const { Media } = context.collections;
  const { _id: productId, shopId } = product;

  if (!Media) return [];

  let includeVariantMedia = {};
  if (!shouldIncludeVariantMedia) {
    includeVariantMedia = { "metadata.variantId": null };
  }

  const mediaArray = await Media.find(
    {
      "metadata.shopId": shopId,
      "metadata.productId": productId,
      ...includeVariantMedia,
      "metadata.workflow": { $nin: ["archived", "unpublished"] }
    },
    {
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    }
  );

  // Denormalize media
  const productMedia = mediaArray
    .map((media) => {
      const { metadata } = media;
      const { priority, productId: prodId, variantId } = metadata || {};

      return {
        _id: media._id,
        priority,
        productId: prodId,
        variantId,
        URLs: {
          large: `${media.url({ store: "large" })}`,
          medium: `${media.url({ store: "medium" })}`,
          original: `${media.url({ store: "image" })}`,
          small: `${media.url({ store: "small" })}`,
          thumbnail: `${media.url({ store: "thumbnail" })}`
        }
      };
    })
    .sort((mediaA, mediaB) => mediaA.priority - mediaB.priority);

  return productMedia;
}
