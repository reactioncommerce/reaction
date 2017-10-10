import { SimpleSchema } from "meteor/aldeed:simple-schema";
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
  rate: {
    type: Number,
    decimal: true
  }
});

registerSchema("TaxRates", TaxRates);
