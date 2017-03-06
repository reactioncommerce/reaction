import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { Shop } from "/lib/collections/schemas/shops.js";

export const MarketplacePackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.public": {
      type: Object,
      optional: true
    }
  },
  {
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
