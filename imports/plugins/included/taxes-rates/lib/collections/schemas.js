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
  shopId: String,
  taxCode: {
    type: String,
    label: "Tax Code",
    optional: true
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
    optional: true
  },
  postal: {
    label: "ZIP/Postal Code",
    type: String,
    optional: true
  },
  country: {
    type: String,
    label: "Country",
    optional: true
  },
  rate: Number
}, { check, tracker: Tracker });

registerSchema("Taxes", Taxes);
