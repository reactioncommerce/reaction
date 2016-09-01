import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Templates = new SimpleSchema({
  name: {
    type: String,
    index: true
  },
  type: {
    type: String
  },
  kind: {
    type: String,
    defaultValue: "template"
  },
  defaultData: {
    type: Object,
    blackbox: true
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
