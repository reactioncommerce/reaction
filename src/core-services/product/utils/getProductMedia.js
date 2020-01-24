/**
 *
 * @method getProductMedia
 * @summary Get an array of ImageInfo objects by Product ID
 * @param {Object} product -  A product of type simple
 * @param {Object} context - The per request context
 * @returns {Promise<Object[]>} Array of ImageInfo objects sorted by priority
 */
export default async function getProductMedia(product, context) {
  const { Media } = context.collections;
  const { _id: productId, shopId } = product;
  if (!Media) return [];

  const mediaArray = await Media.find(
    {
      "metadata.shopId": shopId,
      "metadata.productId": productId,
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
