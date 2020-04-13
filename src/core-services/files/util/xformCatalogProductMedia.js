/**
 * @summary Converts URLs object in a MediaItem to absolute (if not already)
 * @param {Object} context App context
 * @param {Object} mediaItem Media item
 * @returns {Object} Transformed media item
 */
function ensureAbsoluteUrls(context, mediaItem) {
  if (!mediaItem || !mediaItem.URLs) return mediaItem;

  const URLs = {};
  Object.keys(mediaItem.URLs).forEach((name) => {
    URLs[name] = context.getAbsoluteUrl(mediaItem.URLs[name]);
  });

  return { ...mediaItem, URLs };
}

/**
 * @name xformCatalogProductMedia
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms DB media object to final GraphQL result. Calls functions plugins have registered for type
 *  "xformCatalogProductMedia". First to return an object is returned here
 * @param {Object} mediaItem Media item object. See ImageInfo SimpleSchema
 * @param {Object} context Request context
 * @param {Object} info Other info about the media
 * @param {Object} info.shopId ID of the shop that owns the catalog product
 * @returns {Object} Transformed media item
 */
export default async function xformCatalogProductMedia(mediaItem, context, { shopId }) {
  const xformCatalogProductMediaFuncs = context.getFunctionsOfType("xformCatalogProductMedia");
  for (const func of xformCatalogProductMediaFuncs) {
    const xformedMediaItem = await func(mediaItem, context, { shopId }); // eslint-disable-line no-await-in-loop
    if (xformedMediaItem) {
      return ensureAbsoluteUrls(context, xformedMediaItem);
    }
  }

  return ensureAbsoluteUrls(context, mediaItem);
}
