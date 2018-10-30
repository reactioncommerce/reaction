import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name Taxes
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Taxes schema
 */
export const Taxes = new SimpleSchema({
  shopId: {
    type: String,
    index: 1,
    label: "Taxes shopId"
  },
  taxCode: {
    type: String,
    label: "Tax Identifier",
    defaultValue: "RC_TAX",
    index: 1
  },
  taxLocale: {
    label: "Taxation Location",
    type: String,
    allowedValues: ["origin", "destination"],
    defaultValue: "destination"
  },
  region: {
    label: "State/Province/Region",
    type: String,
    optional: true,
    index: 1
  },
  postal: {
    label: "ZIP/Postal Code",
    type: String,
    optional: true,
    index: 1
  },
  country: {
    type: String,
    label: "Country",
    optional: true,
    index: 1
  },
  rate: Number
}, { check, tracker: Tracker });

registerSchema("Taxes", Taxes);
