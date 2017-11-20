import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { TaxPackageConfig } from "/imports/plugins/core/taxes/lib/collections/schemas";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* TaxPackageConfig Schema
*/

export const TaxJarPackageConfig = new SimpleSchema({}, { check, tracker: Tracker })
  .extend(TaxPackageConfig)
  .extend({
    "settings.taxjar": {
      type: Object,
      optional: true,
      defaultValue: {}
    },
    "settings.taxjar.enabled": {
      type: Boolean,
      optional: true,
      defaultValue: false
    },
    "settings.taxjar.apiLoginId": {
      type: String,
      label: "TaxJar API Login ID",
      optional: true
    }
  });

registerSchema("TaxJarPackageConfig", TaxJarPackageConfig);
