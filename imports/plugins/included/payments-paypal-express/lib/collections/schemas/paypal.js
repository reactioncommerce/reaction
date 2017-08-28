import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

export const PaypalExpressPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.auth_and_capture": {
      type: Boolean,
      label: "Capture at time of Auth",
      defaultValue: false
    },
    "settings.reaction-paypal-express.support": {
      type: Array,
      label: "Payment provider supported methods"
    },
    "settings.reaction-paypal-express.support.$": {
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
    "settings.mode": {
      type: Boolean,
      defaultValue: false
    }
  }
]);

