import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";


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
    },
    "settings.reaction-braintree.support": {
      type: Object,
      label: "Payment provider supported methods"
    },
    "settings.reaction-braintree.support.authorize": {
      type: Boolean,
      label: "Authorize",
      defaultValue: true
    },
    "settings.reaction-braintree.support.de_authorize": {
      type: Boolean,
      label: "De-Authorize",
      defaultValue: false
    },
    "settings.reaction-braintree.support.capture": {
      type: Boolean,
      label: "Capture",
      defaultValue: true
    },
    "settings.reaction-braintree.support.refund": {
      type: Boolean,
      label: "Refund",
      defaultValue: true
    }
  }
]);

registerSchema("BraintreePackageConfig", BraintreePackageConfig);

export const BraintreePayment = new SimpleSchema({
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

registerSchema("BraintreePayment", BraintreePayment);
