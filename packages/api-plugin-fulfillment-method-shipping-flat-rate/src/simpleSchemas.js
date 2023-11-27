import SimpleSchema from "simpl-schema";

/**
 * @name MethodFlatRateData
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines FlatRate additional data
 * @property {String} gqlType Defines the method type
 * @property {Number} flatRateData FlatRate Data fields
 */
export const MethodFlatRateData = new SimpleSchema({
  gqlType: String,
  flatRateData: {
    type: Number,
    optional: true
  }
});

export const methodSchema = new SimpleSchema({
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
  "isEnabled": {
    type: Boolean,
    optional: true
  },
  "enabled": {
    type: Boolean,
    optional: true
  },
  "label": String,
  "name": String,
  "fulfillmentMethod": {
    type: String,
    optional: true
  },
  "rate": Number
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

export const restrictionSchema = new SimpleSchema({
  "methodIds": {
    type: Array,
    optional: true
  },
  "methodIds.$": String,
  "type": String,
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": Attributes,
  "destination": {
    type: Destination,
    optional: true
  }
});
