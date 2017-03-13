import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { TaxPackageConfig } from "/imports/plugins/core/taxes/lib/collections/schemas";

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
      type: String,
      label: "Avalara API Login ID"
    },
    "settings.avalara.username": {
      type: String
    },
    "settings.avalara.companyCode": {
      type: String
    },
    "settings.avalara.companyId": {
      type: String
    },
    "settings.avalara.password": {
      type: String
    },
    "settings.avalara.mode": {
      label: "Production Mode",
      type: Boolean,
      defaultValue: false
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
    "settings.avalara.commitDocuments": {
      label: "Commit Documents",
      type: Boolean,
      defaultValue: true
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
    "settings.avalara.logRetentionDuration": {
      label: "Retain Logs Duration (Days)",
      type: Number,
      defaultValue: 30
    },
    "settings.avalara.requestTimeout": {
      label: "Request Timeout",
      type: Number,
      defaultValue: 1500
    },
    "settings.addressValidation.countryList": {
      label: "Enable Address Validation by Country",
      type: [String],
      optional: true
    }
  }
]);
