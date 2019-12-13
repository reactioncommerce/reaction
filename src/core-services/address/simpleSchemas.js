import SimpleSchema from "simpl-schema";

export const AddressValidationRule = new SimpleSchema({
  "_id": String,
  "countryCodes": {
    type: Array,
    optional: true
  },
  "countryCodes.$": String,
  "createdAt": Date,
  "serviceName": String,
  "shopId": String,
  "updatedAt": Date
});
