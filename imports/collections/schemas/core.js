import SimpleSchema from "simpl-schema";

export const Money = new SimpleSchema({
  amount: {
    type: Number,
    min: 0
  },
  currencyCode: String
});

const SurchargeMessagesByLanguage = new SimpleSchema({
  content: String,
  language: String
});

/**
 * @name AppliedSurcharge
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id
 * @property {Money} amount
 * @property {String} cartId optional
 * @property {String} fulfillmentGroupId optional
 * @property {String} messagesByLanguage optional
 * @property {String} reason optional
 * @property {String} surchargeId optional
 */
export const AppliedSurcharge = new SimpleSchema({
  "_id": String,
  "amount": Number,
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
  "messagesByLanguage": {
    type: Array,
    optional: true
  },
  "messagesByLanguage.$": {
    type: SurchargeMessagesByLanguage
  },
  "surchargeId": {
    type: String,
    optional: true
  }
});
