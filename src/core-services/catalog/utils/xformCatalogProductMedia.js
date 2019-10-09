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
export default async function xformCatalogProductMedia(mediaItem, context) {
  const xformCatalogProductMediaFuncs = context.getFunctionsOfType("xformCatalogProductMedia");
  for (const func of xformCatalogProductMediaFuncs) {
    const xformedMediaItem = await func(mediaItem, context); // eslint-disable-line no-await-in-loop
    if (xformedMediaItem) {
      return xformedMediaItem;
    }
  }

  return mediaItem;
}
