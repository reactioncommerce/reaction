import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

export const Money = new SimpleSchema({
  currencyCode: String,
  amount: {
    type: Number,
    min: 0
  }
});

/**
 * @name Surcharge
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id
 * @property {Money} amount
 * @property {Object} message
 * @property {String} surchargeId optional
 */
export const Surcharge = new SimpleSchema({
  _id: String,
  amount: Money,
  messages: {
    type: Object,
    blackbox: true
  },
  surchargeId: {
    type: String,
    optional: true
  }
});
