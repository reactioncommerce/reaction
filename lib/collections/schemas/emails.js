import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

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
  to: {
    type: String
  },

  from: {
    type: String
  },

  subject: {
    type: String
  },

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

  status: {
    type: String
  },

  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      }
      return this.unset();
    }
  },

  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
      return this.unset();
    },
    denyInsert: true,
    optional: true
  }
});

registerSchema("Emails", Emails);
