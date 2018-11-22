import SimpleSchema from "simpl-schema";

export const Money = new SimpleSchema({
  amount: {
    type: Number,
    min: 0
  },
  currencyCode: String,
  displayAmount: {
    type: String,
    optional: true
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
 * @property {Object} message optional
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
  message: {
    type: Object,
    blackbox: true,
    optional: true
  },
  surchargeId: {
    type: String,
    optional: true
  }
});
