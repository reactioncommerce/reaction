import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";

/**
 * @file Shopify connector api methods and helpers
 * @module connectors-shopify
 */

/**
 * @method getApiInfo
 * @summary - get Shopify Api Key, Password and Domain from the Shopify Connect package with the supplied shopId or alternatly the active shopId. should only be used from authenticated methods within the connectors-shopify plugin
 * @private
 * @param  {string} [shopId=Reaction.getShopId()] Optional shopId to get the API info for. Defaults to current shop.
 * @return {object} Shopify API connection information
 */
export function getApiInfo(shopId = Reaction.getShopId()) {
  const shopifyPkg = Reaction.getPackageSettingsWithOptions({
    shopId,
    name: "reaction-connectors-shopify"
  });

  if (!shopifyPkg) {
    throw new Meteor.Error("server-error", `No shopify package found for shop ${Reaction.getShopId()}`);
  }

  const { settings } = shopifyPkg;

  return {
    apiKey: settings.apiKey,
    password: settings.password,
    shopName: settings.shopName
  };
}
