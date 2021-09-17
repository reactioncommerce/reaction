/**
 * @method ensureAbsoluteUrls
 * @summary ensure cart imageInfo URLs are absolute
 * @param {Object} imageInfo - input ImageInfo
 * @param {Object} context - The per request context
 * @returns {Object} infoImage object
 */
function ensureAbsoluteUrls(imageInfo, context) {
  const absoluteImagePaths = {};

  Object.keys(imageInfo).forEach((name) => {
    absoluteImagePaths[name] = context.getAbsoluteUrl(imageInfo[name]);
  });

  return absoluteImagePaths;
}

/**
 *
 * @method imageURLs
 * @summary Get an ImageInfo object for cart item
 * @param {Object} item -  A cart item
 * @param {Object} context - The per request context
 * @returns {Object} ImageInfo object
 */
export default async function imageURLs(item, context) {
  const { Media } = context.collections;
  const { _id: variantId, shopId } = item;
  if (!Media) return {};

  const query = {
    $and: [
      {
        $or: [
          { "metadata.shopId": shopId },
          { "metadata.variantId": variantId }
        ]
      },
      { "metadata.workflow": { $nin: ["archived", "unpublished"] } }
    ]
  };

  const media = await Media.findOne(query);

  if (!media) return {};

  return ensureAbsoluteUrls({
    large: `${media.url({ store: "large" })}`,
    medium: `${media.url({ store: "medium" })}`,
    original: `${media.url({ store: "image" })}`,
    small: `${media.url({ store: "small" })}`,
    thumbnail: `${media.url({ store: "thumbnail" })}`
  }, context);
}
