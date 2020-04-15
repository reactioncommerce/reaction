import SimpleSchema from "simpl-schema";

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

const restrictionSchema = new SimpleSchema({
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

export default restrictionSchema;
