import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Audience } from "./layouts";

export const Templates = new SimpleSchema({
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
    type: [Audience],
    optional: true
  },
  type: {
    type: String
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
  }
});
