import getCatalogProductMedia from "./getCatalogProductMedia.js";

/**
 * @name xformCatalogProductMedia
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms DB media object to final GraphQL result. Calls functions plugins have registered for type
 *  "xformCatalogProductMedia". First to return an object is returned here
 * @param {Object} mediaItem Media item object. See ImageInfo SimpleSchema
 * @param {Object} context Request context
 * @returns {Object} Transformed media item
 */
async function xformCatalogProductMedia(mediaItem, context) {
  const xformCatalogProductMediaFuncs = context.getFunctionsOfType("xformCatalogProductMedia");
  for (const func of xformCatalogProductMediaFuncs) {
    const xformedMediaItem = await func(mediaItem, context); // eslint-disable-line no-await-in-loop
    if (xformedMediaItem) {
      return xformedMediaItem;
    }
  }

  return mediaItem;
}

/**
 * @summary Mutates an array of CartItem or OrderItem to add image fields at read time
 * @param {Object} context App context
 * @param {Object[]} items An array of CartItem or OrderItem objects
 * @param {Object} info Additional info
 * @returns {undefined} Returns nothing. Potentially mutates `items`
 */
export default async function xformItemsAddImageUrls(context, items) {
  if (items.length === 0) return;

  for (const item of items) {
    const { productId, variantId } = item;

    const catalogProductMedia = await getCatalogProductMedia(productId, context.collections); // eslint-disable-line no-await-in-loop

    // Find one image from the catalog to use for the item.
    // Prefer the first variant image. Fallback to the first product image.
    let media;
    if (catalogProductMedia && catalogProductMedia.length) {
      media = catalogProductMedia.find((mediaItem) => mediaItem.variantId === variantId);
      if (!media) [media] = catalogProductMedia;
    }

    // Allow plugins to transform the media object
    if (media) {
      media = await xformCatalogProductMedia(media, context); // eslint-disable-line no-await-in-loop
    }

    item.imageURLs = (media && media.URLs) || null;
  }
}
