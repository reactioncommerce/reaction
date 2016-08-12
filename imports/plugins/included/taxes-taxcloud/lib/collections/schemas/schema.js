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
      label: "TaxCloud API Login ID"
    },
    "settings.taxcloud.apiKey": {
      type: String,
      label: "TaxCloud API Key"
    },
    "settings.taxcloud.refreshPeriod": {
      type: String,
      label: "TaxCode Refresh Period",
      defaultValue: "every 7 days",
      optional: true
    },
    "settings.taxcloud.taxCodeUrl": {
      type: String,
      label: "TaxCode API Url",
      defaultValue: "https://taxcloud.net/tic/?format=json",
      optional: true
    }
  }
]);
