/**
 *
 * @method getVariantMedia
 * @summary Get an array of ImageInfo objects by Variant ID
 * @param {Object} variant -  A product variant or option
 * @param {Object} context - The per request context
 * @returns {Promise<Object[]>} Array of ImageInfo objects sorted by priority
 */
export default async function getVariantMedia(variant, context) {
  const { Media } = context.collections;
  const { _id: variantId, shopId } = variant;
  if (!Media) return [];

  const mediaArray = await Media.find(
    {
      "metadata.shopId": shopId,
      "metadata.variantId": variantId,
      "metadata.workflow": { $nin: ["archived", "unpublished"] }
    },
    {
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    }
  );

  // Denormalize media
  const variantMedia = mediaArray
    .map((media) => {
      const { metadata } = media;
      const { priority, variantId: variantIdLocal } = metadata || {};

      return {
        _id: media._id,
        priority,
        variantId: variantIdLocal,
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

  return variantMedia;
}
