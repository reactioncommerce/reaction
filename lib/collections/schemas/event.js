import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Event for EventLog
 * @memberof schemas
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
}, { check, tracker: Tracker });

registerSchema("Event", Event);
