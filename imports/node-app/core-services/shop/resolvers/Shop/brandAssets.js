/**
 * @name Shop/brandAssets
 * @method
 * @memberof Shop/GraphQL
 * @summary Builds the `brandAssets` object for a shop
 * @param {Object} shop - an object containing the result returned from the parent resolver
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} Promise that resolves with the `brandAssets` object
 */
export default async function brandAssets(shop, args, context) {
  if (!shop || !Array.isArray(shop.brandAssets)) return null;

  const brandAsset = shop.brandAssets.find((asset) => asset.type === "navbarBrandImage");
  if (!brandAsset) return null;

  const { collections: { Media } } = context;

  const fileRecord = await Media.findOne(brandAsset.mediaId);
  if (!fileRecord) return null;

  return {
    navbarBrandImage: {
      large: context.getAbsoluteUrl(fileRecord.url({ store: "large" })),
      medium: context.getAbsoluteUrl(fileRecord.url({ store: "medium" })),
      original: context.getAbsoluteUrl(fileRecord.url({ store: "image" })),
      small: context.getAbsoluteUrl(fileRecord.url({ store: "small" })),
      thumbnail: context.getAbsoluteUrl(fileRecord.url({ store: "thumbnail" }))
    },
    navbarBrandImageId: brandAsset.mediaId
  };
}
