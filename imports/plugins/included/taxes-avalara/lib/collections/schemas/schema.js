import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { TaxPackageConfig } from "/imports/plugins/core/taxes/lib/collections/schemas";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* TaxPackageConfig Schema
*/

export const AvalaraPackageConfig = new SimpleSchema([
  TaxPackageConfig, {
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
      label: "Avalara API Login ID",
      type: String,
    },
    "settings.avalara.username": {
      label: "Username",
      type: String,
    },
    "settings.avalara.password": {
      label: "Password",
      type: String,
    },
    "settings.avalara.companyCode": {
      label: "Company code",
      type: String,
    },
    "settings.avalara.shippingTaxCode": {
      label: "Shipping Tax Code",
      type: String
    },
    "settings.addressValidation.enabled": {
      label: "Address Validation",
      type: Boolean,
      defaultValue: true
    },
    "settings.addressValidation.countryList": {
      label: "Enable Address Validation by Country",
      type: [String],
      optional: true
    },
    "settings.avalara.requestTimeout": {
      label: "Request Timeout",
      type: Number,
      defaultValue: 1500
    },
    "settings.avalara.mode": {
      label: "Production Mode",
      type: Boolean,
      defaultValue: false
    },
    "settings.avalara.performTaxCalculation": {
      label: "Perform Tax Calculation",
      type: Boolean,
      defaultValue: true
    },
    "settings.avalara.enableLogging": {
      label: "Enable Transaction Logging",
      type: Boolean,
      defaultValue: false
    },
    "settings.avalara.companyId": {
      type: String
    },
    "settings.avalara.commitDocuments": {
      label: "Commit Documents",
      type: Boolean,
      defaultValue: true
    },
    "settings.avalara.logRetentionDuration": {
      label: "Retain Logs Duration (Days)",
      type: Number,
      defaultValue: 30
    },
  }
]);

registerSchema("AvalaraPackageConfig", AvalaraPackageConfig);
