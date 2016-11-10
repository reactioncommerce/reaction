import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

export const PaypalPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.express_enabled": {
      type: Boolean,
      defaultValue: true
    },
    "settings.express_auth_and_capture": {
      type: Boolean,
      label: "Capture at time of Auth",
      defaultValue: false
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
  }
]);

export const PaypalPayment = new SimpleSchema({
  payerName: {
    type: String,
    label: "Cardholder name",
    regEx: /[A-Z][a-zA-Z]*/
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

PaypalPayment.messages({
  "regEx payerName": "[label] must include both first and last name"
});
