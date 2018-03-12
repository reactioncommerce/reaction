import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { Templates } from "/lib/collections";
import { shopIdAutoValue } from "/lib/collections/schemas/helpers";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * EmailTemplates Schema
*/

export const EmailTemplates = new SimpleSchema({
  "shopId": {
    type: String,
    index: 1,
    autoValue: shopIdAutoValue,
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
}, { check, tracker: Tracker });

registerSchema("EmailTemplates", EmailTemplates);

Templates.attachSchema(EmailTemplates, { selector: { type: "email" } });
