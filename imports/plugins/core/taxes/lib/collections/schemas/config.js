import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Schemas } from "@reactioncommerce/reaction-collections";
import { Taxes } from "./taxes";
import { registerSchema } from "@reactioncommerce/reaction-collections";

const PackageConfig = Schemas.PackageConfig;

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

registerSchema("TaxPackageConfig", TaxPackageConfig);
