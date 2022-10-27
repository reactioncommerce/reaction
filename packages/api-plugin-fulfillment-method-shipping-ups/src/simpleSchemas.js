import SimpleSchema from "simpl-schema";

/**
 * @name MethodDynamicRateData
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines Dynamic Rate additional data
 * @property {String} gqlType Defines the method type
 * @property {String} dynamicRateData Dynamic Rate Data fields
 */
export const MethodDynamicRateData = new SimpleSchema({
  gqlType: String,
  dynamicRateData: {
    type: String,
    optional: true
  }
});
