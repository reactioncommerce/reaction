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
