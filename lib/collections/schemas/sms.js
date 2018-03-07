import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Sms
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} apiKey optional
 * @property {String} apiToken optional
 * @property {String} shopId optional
 * @property {String} smsPhone optional
 * @property {String} smsProvider optional
 */
export const Sms = new SimpleSchema({
  apiKey: {
    type: String,
    optional: true
  },
  apiToken: {
    type: String,
    optional: true
  },
  shopId: {
    type: String,
    optional: true
  },
  smsPhone: {
    type: String,
    optional: true
  },
  smsProvider: {
    type: String,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("Sms", Sms);
