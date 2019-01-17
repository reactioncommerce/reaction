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

const SurchargeMessage = new SimpleSchema({
  content: String,
  language: String
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
  "_id": String,
  "amount": Money,
  "cartId": {
    type: String,
    optional: true
  },
  "fulfillmentGroupId": {
    type: String,
    optional: true
  },
  /*
   * Message is used as a client message to let customers know why this surcharge might apply
   * It can be saved in various languages
  */
  "message": {
    type: Array,
    optional: true
  },
  "message.$": {
    type: SurchargeMessage
  },
  "surchargeId": {
    type: String,
    optional: true
  }
});
