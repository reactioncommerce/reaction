/**
 *
 * @method getCatalogVariantMedia
 * @summary Get an array of ImageInfo objects by Variant ID
 * @param {String} variantId -  A variant ID. Not a top-level product.
 * @param {Object} collections - Raw mongo collections
 * @return {Promise<Object[]>} Array of ImageInfo objects sorted by priority
 */
export default async function getCatalogVariantMedia(variantId, collections) {
  const { Media } = collections;
  const mediaArray = await Media.find(
    {
      "metadata.variantId": variantId,
      "metadata.toGrid": 1,
      "metadata.workflow": { $nin: ["archived", "unpublished"] }
    },
    {
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    }
  );

  // Denormalize media
  const catalogVariantMedia = mediaArray
    .map((media) => {
      const { metadata } = media;
      const { toGrid, priority, productId, variantId: returnedVariantId } = metadata || {};

      return {
        priority,
        toGrid,
        productId,
        variantId: returnedVariantId,
        URLs: {
          large: `${media.url({ store: "large" })}`,
          medium: `${media.url({ store: "medium" })}`,
          original: `${media.url({ store: "image" })}`,
          small: `${media.url({ store: "small" })}`,
          thumbnail: `${media.url({ store: "thumbnail" })}`
        }
      };
    })
    .sort((a, b) => a.priority - b.priority);

  return catalogVariantMedia;
}
