import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { Discounts } from "./discounts";

/**
* DiscountsPackageConfig Schema
*/

export const DiscountsPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.rates": {
      type: Object,
      optional: true
    },
    "settings.rates.enabled": {
      type: Boolean,
      optional: true,
      defaultValue: false
    },
    "settings.rates.discounts": {
      type: [Discounts],
      optional: true
    }
  }
]);
