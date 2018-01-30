import { registerSchema } from "@reactioncommerce/reaction-collections";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { Taxes } from "./taxes";

/**
* TaxPackageConfig Schema
*/

export const TaxPackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
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
