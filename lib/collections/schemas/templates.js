import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Audience } from "./layouts";

const sharedFields = {
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
  // permissions: {
  //   type: [String],
  //   optional: true
  // },
  // audience: {
  //   type: [String],
  //   optional: true
  // },
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

export const ReactLayout = new SimpleSchema({
  ...sharedFields,
  // permissions: {
  //   type: [String],
  //   optional: true
  // },
  // audience: {
  //   type: [String],
  //   optional: true
  // },
  template: {
    type: [Object],
    optional: true,
    blackbox: true
  }
});

export const Template = new SimpleSchema({
  ...sharedFields,
  // permissions: {
  //   type: [String],
  //   optional: true
  // },
  // audience: {
  //   type: [String],
  //   optional: true
  // },
  template: {
    type: String,
    optional: true
  }
});
