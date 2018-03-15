import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { shopIdAutoValue } from "./helpers";

/**
 * @name Translation
 * @memberof schemas
 * @type {SimpleSchema}
 * @todo Mostly just a blackbox for now. Someday we'll validate the entire schema
 * @property {String} shopId, Translation ShopId
 * @property {String} language, language
 * @property {String} i18n, translation
 * @property {String} ns, namespace
 * @property {Object} translation, blackbox
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
}, { check, tracker: Tracker });

registerSchema("Translation", Translation);
