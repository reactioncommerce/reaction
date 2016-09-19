import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { TaxPackageConfig } from "/imports/plugins/core/taxes/lib/collections/schemas";

/**
* TaxPackageConfig Schema
*/

export const TaxJarPackageConfig = new SimpleSchema([
  TaxPackageConfig, {
    "settings.taxjar": {
      type: Object,
      optional: true
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
  }
]);
