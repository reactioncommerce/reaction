import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
/*
 *  Meteor.settings.stripe =
 *    mode: false  #sandbox
 *    api_key: ""
 *  see: https://stripe.com/docs/api
 */

export const StripePackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.mode": {
      type: Boolean,
      defaultValue: false
    },
    "settings.api_key": {
      type: String,
      label: "API Client ID"
    }
  }
]);

export const StripePayment = new SimpleSchema({
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

StripePayment.messages({
  "regEx payerName": "[label] must include both first and last name"
});
