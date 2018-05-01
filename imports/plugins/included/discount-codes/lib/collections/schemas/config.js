import { DiscountsPackageConfig } from "/imports/plugins/core/discounts/lib/collections/schemas";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name DiscountCodesPackageConfig
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary A schema that extends discount schema with properties for discount codes.
 */
export const DiscountCodesPackageConfig = DiscountsPackageConfig.clone().extend({
  "settings.codes": {
    type: Object,
    optional: true,
    defaultValue: {}
  },
  "settings.codes.enabled": {
    type: Boolean,
    optional: true,
    defaultValue: false
  }
});

registerSchema("DiscountCodesPackageConfig", DiscountCodesPackageConfig);
