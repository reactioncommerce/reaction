import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const ExamplePackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.mode": {
    type: Boolean,
    defaultValue: true
  },
  "settings.apiKey": {
    type: String,
    label: "API Key",
    optional: true
  }
});

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
}, { check, tracker: Tracker });

registerSchema("ExamplePayment", ExamplePayment);
