import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
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
  "status": {
    type: String,
    defaultValue: "new",
    index: 1
  },
  "workflow": {
    type: Array,
    optional: true
  },
  "workflow.$": String
}, { check, tracker: Tracker });

registerSchema("Workflow", Workflow);
