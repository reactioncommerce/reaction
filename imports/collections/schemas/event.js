import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name Event for EventLog
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} title Event title required
 * @property {String} type Event type required
 * @property {String} description Event description optional
 * @property {String} userId User who triggered event optional
 * @property {String} trigger Action that triggered event optional
 * @property {Date} createdAt required
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
