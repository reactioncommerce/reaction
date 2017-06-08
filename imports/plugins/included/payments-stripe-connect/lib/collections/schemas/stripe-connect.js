import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

export const StripeConnectPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.mode": {
      type: Boolean,
      defaultValue: false
    },
    "settings.api_key": {
      type: String,
      label: "API Client ID"
    },
    "settings.transactionFee.enabled": {
      type: Boolean,
      label: "Enable Fee"
    },
    "settings.transactionFee.percentage": {
      type: Number,
      label: "Fee Percentage",
      decimal: true
    }
  }
]);
