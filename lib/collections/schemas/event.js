import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * event schema for an event log
 */
export const Event = new SimpleSchema({
  title: {
    type: String,
    label: "Event Title"
  },
  type: {
    type: String,
    label: "Event Type"
  },
  description: {
    type: String,
    label: "Event Description",
    optional: true
  },
  userId: {
    type: String,
    label: "User who triggered event",
    optional: true
  },
  trigger: {
    type: String,
    label: "What triggered the event",
    optional: true
  },
  createdAt: {
    type: Date,
    label: "Created At"
  }
});

registerSchema("Event", Event);
