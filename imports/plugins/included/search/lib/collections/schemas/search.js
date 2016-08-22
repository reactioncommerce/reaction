import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

export const SearchPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.titleWeightExact": {
      type: Number,
      label: "Weight for Product Title Exact Matches",
      defaultValue: 10,
      max: 10,
      min: 1
    },
    "settings.titleWeightPartial": {
      type: Number,
      label: "Weight for Product Title Partial Matches",
      defaultValue: 5,
      max: 10,
      min: 1
    },
    "settings.includeVariants": {
      type: Boolean,
      label: "Include Variants in Matches",
      defaultValue: true
    },
    "settings.variantWeightExact": {
      type: Number,
      label: "Weight for Variant Title Exact Matches",
      defaultValue: 2,
      max: 10,
      min: 1
    },
    "settings.variantWeightPartial": {
      type: Number,
      label: "Weight for Variant Title Partial Matches",
      defaultValue: 1,
      max: 10,
      min: 1
    }
  }
]);

