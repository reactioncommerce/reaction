import SimpleSchema from "simpl-schema";

/**
 * @name StoreFields
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Specific fields returned by the Store Pickup fulfillment method.
 * @property {String} storeId Store ID
 * @property {String} storeAddress Store Address
 * @property {String} storeTiming Store Timing
 */
const StoreFields = new SimpleSchema({
  storeId: {
    type: String,
    optional: true
  },
  storeAddress: {
    type: String,
    optional: true
  },
  storeTiming: {
    type: String,
    optional: true
  }
});

/**
 * @name MethodStoreData
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines an array of Store fields
 * @property {String} gqlType Defines the method type
 * @property {StoreFields[]} storeData Store Data fields
 */
export const MethodStoreData = new SimpleSchema({
  "gqlType": String,
  "storeData": {
    type: Array,
    optional: true
  },
  "storeData.$": {
    type: StoreFields,
    optional: true
  }
});
