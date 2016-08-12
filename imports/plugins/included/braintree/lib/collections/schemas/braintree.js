import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

/**
 *  Meteor.settings.braintree =
 *    mode: false  #sandbox
 *    merchant_id: ""
 *    public_key: ""
 *    private_key: ""
 *  see: https://developers.braintreepayments.com/javascript+node/reference
 */

export const BraintreePackageConfig = new SimpleSchema([
  PackageConfig,
  {
    "settings.mode": {
      type: Boolean,
      defaultValue: false
    },
    "settings.merchant_id": {
      type: String,
      label: "Merchant ID",
      optional: false
    },
    "settings.public_key": {
      type: String,
      label: "Public Key",
      optional: false
    },
    "settings.private_key": {
      type: String,
      label: "Private Key",
      optional: false
    }
  }
]);

export const BraintreePayment = new SimpleSchema({
  payerName: {
    type: String,
    label: "Cardholder name",
    regEx: /^\w+\s\w+$/
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

BraintreePayment.messages({
  "regEx payerName": "[label] must include both first and last name"
});
