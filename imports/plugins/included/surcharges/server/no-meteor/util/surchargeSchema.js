import SimpleSchema from "simpl-schema";
import { Money } from "imports/collections/schemas/core";

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

const surchargeSchema = new SimpleSchema({
  /*
   * Fulfillment methods this surcharge applies to
   * If blank, it applies to all methods
  */
  "methodIds": {
    type: Array,
    optional: true
  },
  "methodIds.$": String,
  "type": {
    type: String,
    defaultValue: "surcharge"
  },
  /*
   * Order item attributes methods this surcharge applies to
  */
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": Attributes,
  /*
   * Destinations this surcharge applies to
  */
  "destination": {
    type: Destination,
    optional: true
  },
  "amount": {
    type: Money
  },
  /*
   * Message is used as a client message to let customers know why this surcharge might apply
  */
  /* TODO: EK - update this to an array of objects with language */
  "message": {
    type: String
  }
});

export default surchargeSchema;
