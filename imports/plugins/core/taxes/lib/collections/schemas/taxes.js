import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { shopIdAutoValue } from "/lib/collections/schemas/helpers";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* Taxes Schema
*/

export const Taxes = new SimpleSchema({
  "shopId": {
    type: String,
    autoValue: shopIdAutoValue,
    index: 1,
    label: "Taxes shopId"
  },
  "taxCode": {
    type: String,
    label: "Tax Identifier",
    defaultValue: "RC_TAX",
    index: 1
  },
  "cartMethod": {
    label: "Calculation Method",
    type: String,
    allowedValues: ["unit", "row", "total"],
    defaultValue: "total"
  },
  "taxLocale": {
    label: "Taxation Location",
    type: String,
    allowedValues: ["shipping", "billing", "origination", "destination"],
    defaultValue: "destination"
  },
  "taxShipping": {
    label: "Tax Shipping",
    type: Boolean,
    defaultValue: false
  },
  "taxIncluded": {
    label: "Taxes included in product prices",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "discountsIncluded": {
    label: "Tax before discounts",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "region": {
    label: "State/Province/Region",
    type: String,
    optional: true,
    index: 1
  },
  "postal": {
    label: "ZIP/Postal Code",
    type: String,
    optional: true,
    index: 1
  },
  "country": {
    type: String,
    label: "Country",
    optional: true,
    index: 1
  },
  "isCommercial": {
    label: "Commercial address.",
    type: Boolean,
    optional: true
  },
  "rate": Number,
  "method": {
    type: Array,
    optional: true,
    label: "Tax Methods"
  },
  "method.$": {
    type: Object
  },
  "method.$.plugin": {
    type: String,
    label: "Plugin",
    defaultValue: "Custom",
    optional: true
  },
  "method.$.enabled": {
    type: Boolean,
    label: "Enabled",
    defaultValue: true,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("Taxes", Taxes);
