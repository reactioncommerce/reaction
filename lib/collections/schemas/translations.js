import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "./helpers";

/*
* translations schema
* mostly just a blackbox for now
* someday maybe we'll validate the entire schema
* since ui editing for these values are likely
*/

export const Translation = new SimpleSchema({
  shopId: {
    type: String,
    index: 1,
    autoValue: shopIdAutoValue,
    label: "Translation ShopId"
  },
  language: {
    type: String
  },
  i18n: {
    type: String,
    index: 1
  },
  ns: {
    type: String,
    label: "Namespace"
  },
  translation: {
    type: Object,
    blackbox: true
  }
});
