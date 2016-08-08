import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { Taxes } from "./taxes";

/**
* TaxPackageConfig Schema
*/

export const TaxPackageConfig = new SimpleSchema([
  PackageConfig, {
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
      optional: true
    },
    "settings.rates.enabled": {
      type: Boolean,
      optional: true,
      defaultValue: false
    },
    "settings.rates.taxes": {
      type: [Taxes],
      optional: true
    },
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
    },
    "settings.avalara": {
      type: Object,
      optional: true
    },
    "settings.avalara.enabled": {
      type: Boolean,
      optional: true,
      defaultValue: false
    },
    "settings.avalara.apiLoginId": {
      type: String,
      label: "Avalara API Login ID",
      optional: true
    },
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
