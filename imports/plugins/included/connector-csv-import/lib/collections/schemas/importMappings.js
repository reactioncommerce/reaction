import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name ImportMapping
 * @memberof Schemas
 * @type {SimpleSchema}
 */
export const ImportMappings = new SimpleSchema({
  _id: {
    type: String
  },
  reference: {
    type: String,
    label: "Mapping Reference"
  },
  shopId: {
    type: String,
    index: 1,
    label: "Shop"
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
  } // Mapping will be humanized column name to technical field name
});

registerSchema("ImportMappings", ImportMappings);
