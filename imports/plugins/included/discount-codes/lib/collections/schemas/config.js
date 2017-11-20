import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { DiscountsPackageConfig } from "/imports/plugins/core/discounts/lib/collections/schemas";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* Discount Codes Package Config Schema
* @type {Object}
* @desc schema that extends discount schema
* with properties for discount rates.
*/
export const DiscountCodesPackageConfig = new SimpleSchema({}, { check, tracker: Tracker })
  .extend(DiscountsPackageConfig)
  .extend({
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
