import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "./helpers";

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
  templateFor: {
    type: [String],
    optional: true
  },
  template: {
    type: [Object],
    optional: true,
    blackbox: true
  }
});

export const Template = new SimpleSchema({
  ...sharedFields,
  template: {
    type: String,
    optional: true
  }
});
