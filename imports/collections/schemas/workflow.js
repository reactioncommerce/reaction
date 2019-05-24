import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name Workflow
 * @summary Control view flow by attaching layout to a collection.
 * Shop defaultWorkflow is defined in Shop.
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} status, default value: `new`
 * @property {String[]} workflow optional
 */
export const Workflow = new SimpleSchema({
  "status": {
    type: String,
    defaultValue: "new"
  },
  "workflow": {
    type: Array,
    optional: true
  },
  "workflow.$": String
});

registerSchema("Workflow", Workflow);
