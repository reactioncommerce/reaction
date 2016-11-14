import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Templates } from "/lib/collections";


/**
 * EmailTemplates Schema
 * TODO: Update schema with final fields when known
*/

export const EmailTemplates = new SimpleSchema({
  name: {
    type: String
  },
  isOriginalTemplate: {
    type: Boolean,
    optional: true,
    defaultValue: false
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
    defaultValue: "email",
    optional: true
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
    type: String,
    optional: true
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
    type: String,
    optional: true
  },
  subject: {
    type: String,
    optional: true
  }
});

Templates.attachSchema(EmailTemplates, { selector: { type: "email" } });
