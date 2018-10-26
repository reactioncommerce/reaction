import { registerSchema } from "@reactioncommerce/schemas";
import { PackageConfig } from "/lib/collections/schemas";

/**
 * @name TaxPackageConfig
 * @memberof Schemas
 * @type {SimpleSchema}
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
  "settings.taxShipping": {
    type: Boolean,
    defaultValue: false
  }
});

registerSchema("TaxPackageConfig", TaxPackageConfig);
