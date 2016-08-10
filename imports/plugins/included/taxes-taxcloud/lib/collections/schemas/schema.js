import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { TaxPackageConfig } from "/imports/plugins/core/taxes/lib/collections/schemas";

/**
* TaxPackageConfig Schema
*/

export const TaxCloudPackageConfig = new SimpleSchema([
  TaxPackageConfig, {
    "settings.taxcloud": {
      type: Object,
      optional: true
    },
    "settings.taxcloud.enabled": {
      type: Boolean,
      optional: true,
      defaultValue: false
    },
    "settings.taxcloud.apiLoginId": {
      type: String,
      label: "TaxCloud API Login ID",
      optional: true
    }
  }
]);
