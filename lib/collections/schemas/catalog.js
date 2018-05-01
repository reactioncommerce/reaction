import SimpleSchema from "simpl-schema";

/**
 * @name Catalog
 * @memberof Schemas
 * @type {SimpleSchema}
 */
export const Catalog = new SimpleSchema({
  contentType: {
    type: String
  },
  media: {
    type: Object,
    blackbox: true
  },
  variants: {
    type: Object,
    blackbox: true
  }
});
