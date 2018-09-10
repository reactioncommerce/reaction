import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name Mapping
 * @memberof Schemas
 * @type {SimpleSchema}
 */
export const Mappings = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    label: "ID"
  },
  name: {
    type: String,
    label: "Name"
  },
  shopId: {
    type: String,
    index: 1,
    label: "Shop",
    optional: true
  },
  collection: {
    type: String,
    label: "Collection"
  },
  mapping: {
    label: "Mapping",
    type: Object,
    blackbox: true,
    optional: true
  } // Mapping will be CSV column name to technical field name
});

registerSchema("Mappings", Mappings);
