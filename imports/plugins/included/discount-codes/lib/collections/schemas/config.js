import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { DiscountsPackageConfig } from "/imports/plugins/core/discounts/lib/collections/schemas";

/**
* Discount Codes Package Config Schema
* @type {Object}
* @desc schema that extends discount schema
* with properties for discount rates.
*/
export const DiscountCodesPackageConfig = new SimpleSchema([
  DiscountsPackageConfig, {
    "settings.codes": {
      type: Object,
      optional: true
    },
    "settings.codes.enabled": {
      type: Boolean,
      optional: true,
      defaultValue: false
    }
  }
]);
