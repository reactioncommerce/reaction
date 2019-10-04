/**
 *
 * @method getCatalogProductMedia
 * @summary Get an array of ImageInfo objects by Product ID
 * @param {String} productId -  A product ID. Must be a top-level product.
 * @param {Object} collections - Raw mongo collections
 * @returns {Promise<Object[]>} Array of ImageInfo objects sorted by priority
 */
export default async function getCatalogProductMedia(productId, collections) {
  const { Media } = collections;
  const mediaArray = await Media.find(
    {
      "metadata.productId": productId,
      "metadata.workflow": { $nin: ["archived", "unpublished"] }
    },
    {
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    }
  );

  // Denormalize media
  const catalogProductMedia = mediaArray
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

  return catalogProductMedia;
}
