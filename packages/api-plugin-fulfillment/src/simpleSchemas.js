import SimpleSchema from "simpl-schema";

/**
 * @name MethodEmptyData
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines Empty placeholder
 * @property {String} gqlType Defines the method type
 * @property {Boolean} emptyData Empty Data fields
 */
export const MethodEmptyData = new SimpleSchema({
  gqlType: String,
  emptyData: {
    type: Boolean,
    optional: true
  }
});


export const FulfillmentMethodSchema = new SimpleSchema({
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
  "enabled": Boolean,
  "label": String,
  "name": String,
  "fulfillmentMethod": {
    type: String,
    optional: true
  },
  "displayMessageMethod": {
    type: String,
    optional: true
  },
  "rate": Number
});

const ProviderSchema = new SimpleSchema({
  enabled: Boolean,
  label: String,
  name: String
});

export const fulfillmentTypeSchema = new SimpleSchema({
  "name": String,
  "shopId": String,
  "provider": {
    type: ProviderSchema
  },
  "fulfillmentType": String,
  "displayMessageType": {
    type: String,
    optional: true
  },
  "methods": {
    type: Array,
    optional: true
  },
  "methods.$": {
    type: FulfillmentMethodSchema
  }
});
