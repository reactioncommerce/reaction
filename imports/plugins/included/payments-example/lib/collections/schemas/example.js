import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const ExamplePackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.mode": {
      type: Boolean,
      defaultValue: true
    },
    "settings.apiKey": {
      type: String,
      label: "API Key",
      optional: true
    },
    "settings.example-paymentmethod.support": {
      type: Object,
      label: "Payment provider supported methods"
    },
    "settings.example-paymentmethod.authorize": {
      type: Boolean,
      label: "Authorize",
      defaultValue: true
    },
    "settings.example-paymentmethod.support.de_authorize": {
      type: Boolean,
      label: "De-Authorize",
      defaultValue: false
    },
    "settings.example-paymentmethod.support.capture": {
      type: Boolean,
      label: "Capture",
      defaultValue: true
    },
    "settings.example-paymentmethod.support.refund": {
      type: Boolean,
      label: "Refund",
      defaultValue: true
    }
  }
]);

registerSchema("ExamplePackageConfig", ExamplePackageConfig);

export const ExamplePayment = new SimpleSchema({
  payerName: {
    type: String,
    label: "Cardholder name"
  },
  cardNumber: {
    type: String,
    min: 13,
    max: 16,
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

registerSchema("ExamplePayment", ExamplePayment);
