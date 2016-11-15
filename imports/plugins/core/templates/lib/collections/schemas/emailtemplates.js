import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Templates } from "/lib/collections";
import { shopIdAutoValue } from "/lib/collections/schemas/helpers";

/**
 * EmailTemplates Schema
*/

export const EmailTemplates = new SimpleSchema({
  shopId: {
    type: String,
    index: 1,
    autoValue: shopIdAutoValue,
    label: "Template ShopId"
  },
  name: {
    type: String
  },
  priority: {
    type: Number,
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
  audience: {
    type: [String],
    optional: true
  },
  type: {
    type: String,
    defaultValue: "email"
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
  template: {
    type: String,
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
  },
  title: {
    type: String
  },
  subject: {
    type: String,
    optional: true
  }
});

Templates.attachSchema(EmailTemplates, { selector: { type: "email" } });
