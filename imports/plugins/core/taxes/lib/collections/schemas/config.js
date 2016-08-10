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
    }
  }
]);
