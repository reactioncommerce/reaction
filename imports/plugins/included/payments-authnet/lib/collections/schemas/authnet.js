import { SimpleSchema } from "meteor/aldeed:simple-schema";
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

export const AuthNetPackageConfig = new SimpleSchema([
  PackageConfig, {
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
      label: "API Login ID",
      min: 60
    },
    "settings.transaction_key": {
      type: String,
      label: "Transaction Key",
      min: 60
    }
  }
]);

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
});

registerSchema("AuthNetPayment", AuthNetPayment);
