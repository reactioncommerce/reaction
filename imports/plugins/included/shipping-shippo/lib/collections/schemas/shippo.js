import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const ShippoPackageConfig = PackageConfig.clone().extend({
  "settings.apiKey": {
    type: String,
    label: "API Key",
    min: 10,
    optional: true
  }
});

registerSchema("ShippoPackageConfig", ShippoPackageConfig);
