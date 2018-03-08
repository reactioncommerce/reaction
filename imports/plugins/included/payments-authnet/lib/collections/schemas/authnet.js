import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * Meteor.settings.authnet =
 *   mode: false (sandbox)
 *   api_id: ""
 *   transaction_key: ""
 *   see: https://developer.authnet.com/webapps/developer/docs/api/
 *   see: https://github.com/authnet/rest-api-sdk-nodejs
 */

export const AuthNetPackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.mode": {
    type: Boolean,
    defaultValue: false
  },
  "settings.reaction-auth-net.support": {
    type: Array,
    label: "Payment provider supported methods"
  },
  "settings.reaction-auth-net.support.$": {
    type: String,
    allowedValues: ["Authorize", "De-authorize", "Capture"]
  },
  "settings.api_id": {
    type: String,
    label: "API Login ID"
  },
  "settings.transaction_key": {
    type: String,
    label: "Transaction Key"
  }
});

registerSchema("AuthNetPackageConfig", AuthNetPackageConfig);

export const AuthNetPayment = new SimpleSchema({
  payerName: {
    type: String,
    label: "Cardholder name"
  },
  cardNumber: {
    type: String,
    label: "Card number",
    min: 12,
    max: 19
  },
  expireMonth: {
    type: String,
    label: "Expiration month",
    max: 2
  },
  expireYear: {
    type: String,
    label: "Expiration year",
    max: 4
  },
  cvv: {
    type: String,
    label: "CVV",
    max: 4
  }
}, { check, tracker: Tracker });

registerSchema("AuthNetPayment", AuthNetPayment);
