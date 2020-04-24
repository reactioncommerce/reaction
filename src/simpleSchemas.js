import SimpleSchema from "simpl-schema";

export const SurchargeMessagesByLanguage = new SimpleSchema({
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

/**
 * @name Attributes
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} property required
 * @property {String} value required
 * @property {String} propertyType required
 * @property {String} operator required
 */
export const Attributes = new SimpleSchema({
  property: String,
  value: String,
  propertyType: String,
  operator: String
});

/**
 * @name Destination
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} country optional
 * @property {String} region optional
 * @property {String} postal optional
 */
export const Destination = new SimpleSchema({
  "country": {
    type: Array,
    optional: true
  },
  "country.$": String,
  "region": {
    type: Array,
    optional: true
  },
  "region.$": String,
  "postal": {
    type: Array,
    optional: true
  },
  "postal.$": String
});

/**
 * @name Message
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} content
 * @property {String} language
 */
const Message = new SimpleSchema({
  content: String,
  language: String
});

export const Surcharge = new SimpleSchema({
  "_id": String,
  "amount": {
    type: Number
  },
  /*
   * Order item attributes methods this surcharge applies to
  */
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": Attributes,
  "createdAt": Date,
  /*
   * Destinations this surcharge applies to
  */
  "destination": {
    type: Destination,
    optional: true
  },
  /*
   * Message is used as a client message to let customers know why this surcharge might apply
   * It can be saved in various languages
  */
  "messagesByLanguage": {
    type: Array
  },
  "messagesByLanguage.$": {
    type: Message
  },
  /*
   * Fulfillment methods this surcharge applies to
   * If blank, it applies to all methods
  */
  "methodIds": {
    type: Array,
    optional: true
  },
  "methodIds.$": String,
  "shopId": String,
  "type": {
    type: String,
    defaultValue: "surcharge"
  },
  "updatedAt": {
    type: Date,
    optional: true
  }
});
