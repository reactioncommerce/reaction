import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * workflow schema for attaching to collection where
 * PackageWorkflow is controlling view flow
 * Shop defaultWorkflow is defined in Shop
 */

export const Workflow = new SimpleSchema({
  status: {
    type: String,
    defaultValue: "new",
    index: 1
  },
  workflow: {
    type: [String],
    optional: true
  }
});

registerSchema("Workflow", Workflow);
