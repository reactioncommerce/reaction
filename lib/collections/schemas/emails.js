import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { createdAtAutoValue, updatedAtAutoValue } from "./helpers";

/**
 * @name Emails
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} to required
 * @property {String} from required
 * @property {String} subject required
 * @property {String} text optional
 * @property {String} html optional
 * @property {String} userId optional
 * @property {String} jobId required
 * @property {String} type optional
 * @property {String} status optional
 * @property {Date} createdAt required
 * @property {Date} updatedAt required
 */
export const Emails = new SimpleSchema({
  to: String,
  from: String,
  subject: String,
  text: {
    type: String,
    optional: true
  },
  html: {
    type: String,
    optional: true
  },
  userId: {
    type: String,
    optional: true
  },
  jobId: {
    type: String,
    index: true
  },
  type: {
    type: String,
    optional: true
  },
  status: String,
  createdAt: {
    type: Date,
    autoValue: createdAtAutoValue
  },
  updatedAt: {
    type: Date,
    autoValue: updatedAtAutoValue,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("Emails", Emails);
