/**
 * @method getShopLogo
 * @summary Get absolute URL for shop logo, if available. If not, use default logo URL.
 * @param  {Object} context App context
 * @param  {Object} shop The shop document
 * @returns {String} Absolute image URL
 */
export default async function getShopLogo(context, shop) {
  const { collections } = context;
  const { Media } = collections;

  let emailLogo;
  if (Array.isArray(shop.brandAssets)) {
    const brandAsset = shop.brandAssets.find((asset) => asset.type === "navbarBrandImage");
    const fileRecord = brandAsset && await Media.findOne(brandAsset.mediaId);
    emailLogo = fileRecord && fileRecord.url({ absolute: true, store: "medium" });
  }
  return emailLogo || context.getAbsoluteUrl("resources/email-templates/shop-logo.png");
}
