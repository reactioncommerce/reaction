import { DiscountsPackageConfig } from "/imports/plugins/core/discounts/lib/collections/schemas";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* Discount Rates Package Config Schema
* @type {Object}
* @desc schema that extends discount schema
* with properties for discount rates.
*/
export const DiscountRatesPackageConfig = DiscountsPackageConfig.clone().extend({
  "settings.rates": {
    type: Object,
    optional: true,
    defaultValue: {}
  },
  "settings.rates.enabled": {
    type: Boolean,
    optional: true,
    defaultValue: false
  }
});

registerSchema("DiscountRatesPackageConfig", DiscountRatesPackageConfig);
