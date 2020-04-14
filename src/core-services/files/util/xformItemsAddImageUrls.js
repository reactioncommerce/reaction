import getCatalogProductMedia from "./getCatalogProductMedia.js";
import xformCatalogProductMedia from "./xformCatalogProductMedia.js";

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
    const { productId, shopId, variantId } = item;

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
      media = await xformCatalogProductMedia(media, context, { shopId }); // eslint-disable-line no-await-in-loop
    }

    item.imageURLs = (media && media.URLs) || null;
  }
}
