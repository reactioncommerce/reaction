import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

export const PayflowProPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.support": {
      type: Array,
      label: "Payment provider supported methods"
    },
    "settings.support.$": {
      type: String,
      allowedValues: ["Authorize", "De-authorize", "Capture", "Refund"]
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
    "settings.mode": {
      type: Boolean,
      defaultValue: false
    }
  }
]);

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
});

