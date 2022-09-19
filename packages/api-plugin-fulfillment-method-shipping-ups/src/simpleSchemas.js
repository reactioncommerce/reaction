import SimpleSchema from "simpl-schema";

/**
 * @name MethodUPSData
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines UPS additional data
 * @property {String} gqlType Defines the method type
 * @property {String} upsData UPS Data fields
 */
export const MethodUPSData = new SimpleSchema({
  gqlType: String,
  upsData: {
    type: String,
    optional: true
  }
});
