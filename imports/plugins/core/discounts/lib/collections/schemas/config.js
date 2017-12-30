import { PackageConfig } from "/lib/collections/schemas/registry";
import { Discounts } from "./discounts";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* DiscountsPackageConfig Schema
*/

export const DiscountsPackageConfig = PackageConfig.clone().extend({
  "settings.rates": {
    type: Object,
    optional: true,
    defaultValue: {}
  },
  "settings.rates.enabled": {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  "settings.rates.discounts": {
    type: Array,
    optional: true
  },
  "settings.rates.discounts.$": {
    type: Discounts
  }
});

registerSchema("DiscountsPackageConfig", DiscountsPackageConfig);
