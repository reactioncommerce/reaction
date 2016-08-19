import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

export const SearchPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.includeVariants": {
      type: Boolean,
      defaultValue: true
    },
    "settings.variantWeight": {
      type: Number,
      defaultValue: 1
    }
  }
]);

