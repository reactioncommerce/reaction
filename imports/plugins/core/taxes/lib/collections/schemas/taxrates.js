import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* TaxRates Schema
*/

export const TaxRates = new SimpleSchema({
  country: {
    type: String
  },
  county: {
    type: String,
    optional: true
  },
  postal: {
    type: String,
    optional: true
  },
  rate: Number
}, { check, tracker: Tracker });

registerSchema("TaxRates", TaxRates);
