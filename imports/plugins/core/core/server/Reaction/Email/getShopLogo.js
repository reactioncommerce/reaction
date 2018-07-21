import { Meteor } from "meteor/meteor";
import { Media } from "/imports/plugins/core/files/server";

/**
 * @method getShopLogo
 * @summary Get absolute URL for shop logo, if available. If not, use default logo URL.
 * @memberof Email
 * @param  {Object} shop - shop
 * @return {String} Absolute image URL
 */
export default function getShopLogo(shop) {
  let emailLogo;
  if (Array.isArray(shop.brandAssets)) {
    const brandAsset = shop.brandAssets.find((asset) => asset.type === "navbarBrandImage");
    const fileRecord = brandAsset && Promise.await(Media.findOne(brandAsset.mediaId));
    emailLogo = fileRecord && fileRecord.url({ absolute: true, store: "medium" });
  }
  return emailLogo || `${Meteor.absoluteUrl()}resources/email-templates/shop-logo.png`;
}
