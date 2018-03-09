import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Notification
 * @memberof schemas
 * @type {SimpleSchema}
 * @summary Notification sends messages corresponding to the type:
 * - `orderCanceled`  : "Your order was canceled."
 * - `forAdmin`       : "You have a new order."
 * - `newOrder`       : "You just made an order."
 * - `orderDelivered` : "Your order has been delivered."
 * - `orderProcessing`: "Your order is being processed."
 * - `orderShipped`   : "Your order has been shipped."
 * @property {String} message required
 * @property {String} type required, types: `orderCanceled`, `forAdmin`, `newOrder`, `orderDelivered`, `orderProcessing`, `orderShipped`
 * @property {String} url required
 * @property {String} to required
 * @property {Boolean} hasDetails required
 * @property {String} details required
 * @property {String} status required, default: `unread`
 * @property {Date} timeSent required
 */
export const Notification = new SimpleSchema({
  message: {
    type: String,
    optional: false
  },
  type: {
    type: String,
    optional: false
  },
  url: {
    type: String,
    optional: false
  },
  to: {
    type: String,
    optional: false
  },
  hasDetails: {
    type: Boolean,
    optional: false
  },
  details: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    optional: false,
    defaultValue: "unread"
  },
  timeSent: {
    type: Date,
    optional: false,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();
    }
  }
}, { check, tracker: Tracker });

registerSchema("Notification", Notification);
