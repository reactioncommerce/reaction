import SimpleSchema from "simpl-schema";

const methodSchema = new SimpleSchema({
  "cost": {
    type: Number,
    optional: true
  },
  "fulfillmentTypes": {
    type: Array,
    minCount: 1
  },
  "fulfillmentTypes.$": String,
  "group": String,
  "handling": Number,
  "isEnabled": Boolean,
  "label": String,
  "name": String,
  "rate": Number
});

export default methodSchema;
