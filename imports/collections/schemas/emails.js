import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { createdAtAutoValue, updatedAtAutoValue } from "./helpers";

/**
 * @name Emails
 * @memberof Schemas
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
  jobId: String,
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
});

registerSchema("Emails", Emails);
