import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const WorkflowTransitions = new SimpleSchema({
  name: {
    type: String
  },
  from: {
    type: String
  },
  to: {
    type: String
  }
});
registerSchema("WorkflowTransitions", WorkflowTransitions);
