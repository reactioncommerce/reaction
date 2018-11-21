import changeLayouts from "./changeLayouts";
import createShop from "./createShop";
import createTag from "./createTag";
import fetchCurrencyRate from "./fetchCurrencyRate";
import flushCurrencyRate from "./flushCurrencyRate";
import getCurrencyRates from "./getCurrencyRates";
import getLocale from "./getLocale";
import getWorkflow from "./getWorkflow";
import hideHeaderTag from "./hideHeaderTag";
import locateAddress from "./locateAddress";
import removeHeaderTag from "./removeHeaderTag";
import resetShopId from "./resetShopId";
import togglePackage from "./togglePackage";
import updateBrandAssets from "./updateBrandAssets";
import updateCurrencyConfiguration from "./updateCurrencyConfiguration";
import updateDefaultParcelSize from "./updateDefaultParcelSize";
import updateHeaderTags from "./updateHeaderTags";
import updateLanguageConfiguration from "./updateLanguageConfiguration";
import updateShopExternalServices from "./updateShopExternalServices";

/**
 * @file Meteor methods for Shop
 *
 *
 * @namespace Shop/Methods
*/

export default {
  "shop/changeLayouts": changeLayouts,
  "shop/createShop": createShop,
  "shop/createTag": createTag,
  "shop/fetchCurrencyRate": fetchCurrencyRate,
  "shop/flushCurrencyRate": flushCurrencyRate,
  "shop/getCurrencyRates": getCurrencyRates,
  "shop/getLocale": getLocale,
  "shop/getWorkflow": getWorkflow,
  "shop/hideHeaderTag": hideHeaderTag,
  "shop/locateAddress": locateAddress,
  "shop/removeHeaderTag": removeHeaderTag,
  "shop/resetShopId": resetShopId,
  "shop/togglePackage": togglePackage,
  "shop/updateBrandAssets": updateBrandAssets,
  "shop/updateCurrencyConfiguration": updateCurrencyConfiguration,
  "shop/updateDefaultParcelSize": updateDefaultParcelSize,
  "shop/updateHeaderTags": updateHeaderTags,
  "shop/updateLanguageConfiguration": updateLanguageConfiguration,
  "shop/updateShopExternalServices": updateShopExternalServices
};
