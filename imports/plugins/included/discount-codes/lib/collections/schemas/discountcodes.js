import { SimpleSchema } from "meteor/aldeed:simple-schema";

/**
* DiscountCodes Schema
*/

export const DiscountCodes = new SimpleSchema({
  id: {
    type: String,
    label: "Tax Id",
    unique: true
  },
  shopId: {
    type: String,
    optional: true
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
