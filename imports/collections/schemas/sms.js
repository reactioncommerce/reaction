import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name Sms
 * @memberof Schemas
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
});

registerSchema("Sms", Sms);
