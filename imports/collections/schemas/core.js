import SimpleSchema from "simpl-schema";

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
 * @property {String} cartId optional
 * @property {String} fulfillmentGroupId optional
 * @property {Object} message
 * @property {String} surchargeId optional
 */
export const Surcharge = new SimpleSchema({
  _id: String,
  amount: Money,
  cartId: {
    type: String,
    optional: true
  },
  fulfillmentGroupId: {
    type: String,
    optional: true
  },
  messages: {
    type: Object,
    blackbox: true
  },
  surchargeId: {
    type: String,
    optional: true
  }
});
