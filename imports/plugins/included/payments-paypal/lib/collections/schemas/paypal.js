import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const PaypalPackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.expressAuthAndCapture": {
    type: Boolean,
    label: "Capture at time of Auth",
    defaultValue: false
  },
  "settings.express.support": {
    type: Array,
    label: "Payment provider supported methods"
  },
  "settings.express.support.$": {
    type: String,
    allowedValues: ["Authorize", "De-authorize", "Capture", "Refund"]
  },
  "settings.payflow.support": {
    type: Array,
    label: "Payment provider supported methods"
  },
  "settings.payflow.support.$": {
    type: String,
    allowedValues: ["Authorize", "De-authorize", "Capture", "Refund"]
  },
  "settings.merchantId": {
    type: String,
    label: "Merchant ID",
    optional: true
  },
  "settings.username": {
    type: String,
    label: "Username",
    optional: true
  },
  "settings.password": {
    type: String,
    label: "Password",
    optional: true
  },
  "settings.signature": {
    type: String,
    label: "Signature",
    optional: true
  },
  "settings.express_mode": {
    type: Boolean,
    defaultValue: false
  },
  "settings.payflow_enabled": {
    type: Boolean,
    defaultValue: true
  },
  "settings.client_id": {
    type: String,
    label: "API Client ID",
    min: 60,
    optional: true
  },
  "settings.client_secret": {
    type: String,
    label: "API Secret",
    min: 60,
    optional: true
  },
  "settings.payflow_mode": {
    type: Boolean,
    defaultValue: false
  }
});

registerSchema("PaypalPackageConfig", PaypalPackageConfig);

export const PaypalPayment = new SimpleSchema({
  payerName: {
    type: String,
    label: "Cardholder name"
  },
  cardNumber: {
    type: String,
    min: 12,
    max: 19,
    label: "Card number"
  },
  expireMonth: {
    type: String,
    max: 2,
    label: "Expiration month"
  },
  expireYear: {
    type: String,
    max: 4,
    label: "Expiration year"
  },
  cvv: {
    type: String,
    max: 4,
    label: "CVV"
  }
}, { check, tracker: Tracker });

registerSchema("PaypalPayment", PaypalPayment);
