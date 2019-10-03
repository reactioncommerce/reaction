/**
 * @name xformFileCollectionsProductMedia
 * @method
 * @memberof GraphQL/Transforms
 * @param {Object} mediaItem object from a catalog product
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} transformed product media item
 */
export default function xformFileCollectionsProductMedia(mediaItem, context) {
  if (!(mediaItem && mediaItem.URLs)) return null;

  const { priority, productId, variantId, URLs: { large, medium, original, small, thumbnail } } = mediaItem;

  return {
    priority,
    productId,
    variantId,
    URLs: {
      large: context.getAbsoluteUrl(large),
      medium: context.getAbsoluteUrl(medium),
      original: context.getAbsoluteUrl(original),
      small: context.getAbsoluteUrl(small),
      thumbnail: context.getAbsoluteUrl(thumbnail)
    }
  };
}
