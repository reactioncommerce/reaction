import SimpleSchema from "simpl-schema";

/**
 * @name EmailTemplates
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary EmailTemplates schema
 */
export const EmailTemplates = new SimpleSchema({
  "shopId": {
    type: String,
    label: "Template ShopId"
  },
  "name": {
    type: String,
    optional: true
  },
  "priority": {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 1
  },
  "enabled": {
    type: Boolean,
    defaultValue: true
  },
  "route": {
    type: String,
    optional: true
  },
  "audience": {
    type: Array,
    optional: true
  },
  "audience.$": {
    type: String
  },
  "type": {
    type: String,
    defaultValue: "email",
    optional: true
  },
  "provides": {
    type: String,
    defaultValue: "template"
  },
  "block": {
    type: String,
    optional: true
  },
  "defaultData": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "template": {
    type: String,
    optional: true
  },
  "parser": {
    type: String,
    optional: true
  },
  "language": {
    type: String,
    optional: true,
    defaultValue: "en"
  },
  "source": {
    type: String,
    optional: true
  },
  "title": {
    type: String,
    optional: true
  },
  "subject": {
    type: String,
    optional: true
  }
});
