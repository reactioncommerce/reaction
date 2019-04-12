import { Media } from "/imports/plugins/core/files/server";

/**
 * @method getShopLogo
 * @summary Get absolute URL for shop logo, if available. If not, use default logo URL.
 * @param  {Object} context App context
 * @param  {Object} shop The shop document
 * @return {String} Absolute image URL
 */
export default async function getShopLogo(context, shop) {
  let emailLogo;
  if (Array.isArray(shop.brandAssets)) {
    const brandAsset = shop.brandAssets.find((asset) => asset.type === "navbarBrandImage");
    const fileRecord = brandAsset && await Media.findOne(brandAsset.mediaId);
    emailLogo = fileRecord && fileRecord.url({ absolute: true, store: "medium" });
  }
  return emailLogo || context.getAbsoluteUrl("resources/email-templates/shop-logo.png");
}
