import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { shopIdAutoValue } from "./helpers";

/**
 * @name sharedFields
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} shopId Template ShopId
 * @property {String} name required
 * @property {String} title optional
 * @property {Number} priority optional, default value: 1
 * @property {Boolean} enabled default value: true
 * @property {String} route optional
 * @property {String} type default value: `template`
 * @property {String} provides default value: `template`
 * @property {String} block optional
 * @property {Object} defaultData optional, blackbox
 * @property {String} parser required
 * @property {String} language optional, default value: `en`
 * @property {String} source optional
 */
const sharedFields = {
  shopId: {
    type: String,
    index: 1,
    autoValue: shopIdAutoValue,
    label: "Template ShopId"
  },
  name: {
    type: String
  },
  title: {
    type: String,
    optional: true
  },
  priority: {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 1
  },
  enabled: {
    type: Boolean,
    defaultValue: true
  },
  route: {
    type: String,
    optional: true
  },
  type: {
    type: String,
    defaultValue: "template"
  },
  provides: {
    type: String,
    defaultValue: "template"
  },
  block: {
    type: String,
    optional: true
  },
  defaultData: {
    type: Object,
    blackbox: true,
    optional: true
  },
  parser: {
    type: String
  },
  language: {
    type: String,
    optional: true,
    defaultValue: "en"
  },
  source: {
    type: String,
    optional: true
  }
};

/**
 * @name ReactLayout
 * @memberof schemas
 * @summary Extends fields from sharedFields
 * @type {SimpleSchema}
 * @extends {sharedFields}
 * @property {String[]} templateFor optional
 * @property {Object[]} template optional, blackbox
 */
export const ReactLayout = new SimpleSchema({
  ...sharedFields,
  "templateFor": {
    type: Array,
    optional: true
  },
  "templateFor.$": String,
  "template": {
    type: Array,
    optional: true
  },
  "template.$": {
    type: Object,
    blackbox: true
  }
}, { check, tracker: Tracker });

registerSchema("ReactLayout", ReactLayout);

/**
 * @name Template
 * @memberof schemas
 * @summary Extends fields from sharedFields
 * @type {SimpleSchema}
 * @extends {sharedFields}
 * @property {Object[]} template optional, blackbox
 */
export const Template = new SimpleSchema({
  ...sharedFields,
  template: {
    type: String,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("Template", Template);
