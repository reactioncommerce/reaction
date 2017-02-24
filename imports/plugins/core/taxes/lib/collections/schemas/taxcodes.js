import { SimpleSchema } from "meteor/aldeed:simple-schema";

/**
* TaxCodes Schema
*/

export const TaxCodes = new SimpleSchema({
  id: {
    type: String,
    label: "Tax Id",
    unique: true
  },
  shopId: {
    type: String
  },
  taxCode: {
    type: String,
    label: "Tax Code"
  },
  taxCodeProvider: {
    type: String,
    label: "Tax Code Provider"
  },
  ssuta: {
    type: Boolean,
    label: "Streamlined Sales Tax",
    optional: true,
    defaultValue: false
  },
  title: {
    type: String,
    optional: true
  },
  label: {
    type: String,
    optional: true
  },
  parent: {
    type: String,
    optional: true
  },
  children: {
    type: [Object],
    optional: true,
    blackbox: true
  }
});
