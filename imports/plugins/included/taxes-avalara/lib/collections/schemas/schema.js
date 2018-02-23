import SimpleSchema from "simpl-schema";
import { TaxPackageConfig } from "/imports/plugins/core/taxes/lib/collections/schemas";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* TaxPackageConfig Schema
*/

export const AvalaraPackageConfig = TaxPackageConfig.clone().extend({
  "settings.avalara": {
    type: Object,
    optional: true,
    defaultValue: {}
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
    type: String,
    optional: true
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
    type: SimpleSchema.Integer,
    defaultValue: 30
  },
  "settings.avalara.requestTimeout": {
    label: "Request Timeout",
    type: SimpleSchema.Integer,
    defaultValue: 1500
  },
  "settings.addressValidation.countryList": {
    label: "Enable Address Validation by Country",
    type: Array,
    optional: true,
    defaultValue: ["US", "CA"]
  },
  "settings.addressValidation.countryList.$": {
    type: String
  }
});

registerSchema("AvalaraPackageConfig", AvalaraPackageConfig);
