import { SimpleSchema } from "meteor/aldeed:simple-schema";

/**
 * workflow schema for attaching to collection where
 * PackageWorkflow is controlling view flow
 * Shop defaultWorkflow is defined in Shop
 */

export const Event = new SimpleSchema({
  title: {
    type: String
  },
  type: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  userId: {
    type: String,
    optional: true
  },
  trigger: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    autovalue: () => { return new Date(); }
  }
});
