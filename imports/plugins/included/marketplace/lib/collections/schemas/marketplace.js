import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { Shop } from "/lib/collections/schemas/shops.js";

export const ShopTypes = new SimpleSchema({
  shopType: {
    type: String,
    defaultValue: "merchant"
  },
  active: {
    type: Boolean,
    defaultValue: false
  }
});

export const MarketplacePackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.thirdPartyLogistics": {
      type: Object,
      blackbox: true,
      optional: true
    },
    "settings.activeShopTypes": {
      type: [ShopTypes],
      defaultValue: [{
        shopType: "merchant",
        active: true
      }, {
        shopType: "affiliate",
        active: false
      }]
    },
    "settings.payoutMethod": {
      type: Object,
      blackbox: true,
      optional: true
    },
    "settings.public": {
      type: Object,
      optional: true
    },
    // if true, each merchant performs their own fulfillment
    "settings.public.merchantFulfillment": {
      type: Boolean,
      defaultValue: true
    },
    // if true, permit each merchant to setup their own payment provider
    "settings.public.perMerchantPaymentProviders": {
      type: Boolean,
      defaultValue: false
    },
    // if true, permit each merchant to setup their own shipping rates
    "settings.public.perMerchantShippingRates": {
      type: Boolean,
      defaultValue: false
    },
    // if true, any user can create a shop
    // if false, shop owners must be invited via Accounts panel
    "settings.public.allowMerchantSignup": {
      type: Boolean,
      defaultValue: false
    },
    "settings.public.allowGuestSellers": {
      type: Boolean,
      defaultValue: false
    }
  }
]);

/**
 * Seller Shop Schema
 */
export const SellerShop = new SimpleSchema([
  Shop, {
    stripeConnectSettings: {
      type: Object,
      optional: true
    }
  }
]);
