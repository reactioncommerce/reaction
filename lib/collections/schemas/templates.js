import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "./helpers";
import { registerSchema } from "@reactioncommerce/reaction-collections";

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

registerSchema("ReactLayout", ReactLayout);

export const Template = new SimpleSchema({
  ...sharedFields,
  template: {
    type: String,
    optional: true
  }
});

registerSchema("Template", Template);
