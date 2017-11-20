import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { Taxes } from "./taxes";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* TaxPackageConfig Schema
*/

export const TaxPackageConfig = new SimpleSchema({}, { check, tracker: Tracker })
  .extend(PackageConfig)
  .extend({
    "settings.defaultTaxCode": {
      type: String,
      optional: true
    },
    "settings.taxIncluded": {
      type: Boolean,
      defaultValue: false
    },
    "settings.taxShipping": {
      type: Boolean,
      defaultValue: false
    },
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
    "settings.rates.taxes": {
      type: Array,
      optional: true
    },
    "settings.rates.taxes.$": {
      type: Taxes
    }
  });

registerSchema("TaxPackageConfig", TaxPackageConfig);
