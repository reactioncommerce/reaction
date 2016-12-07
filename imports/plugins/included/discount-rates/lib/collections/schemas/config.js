import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { DiscountsPackageConfig } from "/imports/plugins/core/discounts/lib/collections/schemas";

/**
* Discount Rates Package Config Schema
* @type {Object}
* @desc schema that extends discount schema
* with properties for discount rates.
*/
export const DiscountRatesPackageConfig = new SimpleSchema([
  DiscountsPackageConfig, {
    "settings.rates": {
      type: Object,
      optional: true
    },
    "settings.rates.enabled": {
      type: Boolean,
      optional: true,
      defaultValue: false
    }
  }
]);
