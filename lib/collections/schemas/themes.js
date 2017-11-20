import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Themes
 * @summary Schema for themes used in reaction-layout
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} name required
 * @property {String} author optional
 * @property {String} layout default value: `coreLayout`
 * @property {String} url optional
 * @property {Object[]} components optional, blackbox
 */
export const Themes = new SimpleSchema({
  "name": {
    type: String,
    index: true
  },
  "author": {
    type: String,
    optional: true
  },
  "layout": {
    type: String,
    optional: true,
    defaultValue: "coreLayout"
  },
  "url": {
    type: String,
    optional: true
  },
  "components": {
    type: Array,
    optional: true
  },
  "components.$": {
    type: Object,
    blackbox: true
  }
}, { check, tracker: Tracker });

registerSchema("Themes", Themes);
