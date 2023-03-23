import SimpleSchema from "simpl-schema";

/**
 * @name Webhook
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id optional
 * @property {String} address required
 * @property {String} shopId required
 * @property {String} topic required
 * @property {Integer} failureCounter required default value: 0
 * @property {Date} createdAt required
 * @property {Date} updatedAt required
 */
export const Webhook = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  shopId: {
    type: String,
    optional: false
  },
  address: {
    type: String,
    optional: false
  },
  topic: {
    type: String,
    optional: false
  },
  failureCounter: {
    type: SimpleSchema.Integer,
    optional: false,
    defaultValue: 0
  },
  createdAt: {
    type: Date,
    optional: false
  },
  updatedAt: {
    type: Date,
    optional: false
  }
});
