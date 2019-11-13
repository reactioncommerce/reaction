import SimpleSchema from "simpl-schema";

/**
 * @name EmailTemplates
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary EmailTemplates schema
 */
export const EmailTemplates = new SimpleSchema({
  "audience": {
    optional: true,
    type: Array
  },
  "audience.$": {
    type: String
  },
  "block": {
    optional: true,
    type: String
  },
  "defaultData": {
    blackbox: true,
    optional: true,
    type: Object
  },
  "enabled": {
    defaultValue: true,
    type: Boolean
  },
  "language": {
    defaultValue: "en",
    optional: true,
    type: String
  },
  "name": {
    optional: true,
    type: String
  },
  "parser": {
    optional: true,
    type: String
  },
  "priority": {
    defaultValue: 1,
    optional: true,
    type: SimpleSchema.Integer
  },
  "provides": {
    defaultValue: "template",
    type: String
  },
  "route": {
    optional: true,
    type: String
  },
  "shopId": {
    label: "Template ShopId",
    type: String
  },
  "source": {
    optional: true,
    type: String
  },
  "subject": {
    optional: true,
    type: String
  },
  "template": {
    optional: true,
    type: String
  },
  "title": {
    optional: true,
    type: String
  },
  "type": {
    defaultValue: "email",
    optional: true,
    type: String
  }
});
