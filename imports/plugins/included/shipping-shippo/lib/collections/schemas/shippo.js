import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const ShippoPackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.apiKey": {
    type: String,
    label: "API Key",
    min: 10,
    optional: true
  }
});

registerSchema("ShippoPackageConfig", ShippoPackageConfig);
