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
 * @property {String} message optional
 * @property {String} reason optional
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
  /* TODO: EK - update this to an array of objects with language */
  /*
   * Message is used as a client message to let customers know why this surcharge might apply
  */
  message: {
    type: String,
    optional: true
  },
  /* TODO: EK - update this to an array of objects with language */
  /*
   * Reason is used as an internal message to let operators know why this surcharge might apply
  */
  reason: {
    type: String,
    optional: true
  },
  surchargeId: {
    type: String,
    optional: true
  }
});
