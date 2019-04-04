import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { shopIdAutoValue } from "./helpers";

const sharedFields = {
  shopId: {
    type: String,
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
 * @memberof Schemas
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
});

registerSchema("ReactLayout", ReactLayout);

/**
 * @memberof Schemas
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
 * @property {Object[]} template optional, blackbox
 */
export const Template = new SimpleSchema({
  ...sharedFields,
  template: {
    type: String,
    optional: true
  }
});

registerSchema("Template", Template);
