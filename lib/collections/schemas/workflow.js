import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Workflow
 * @summary Control view flow by attaching layout to a collection.
 * Shop defaultWorkflow is defined in Shop.
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} status, default value: `new`
 * @property {String[]} workflow optional
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
