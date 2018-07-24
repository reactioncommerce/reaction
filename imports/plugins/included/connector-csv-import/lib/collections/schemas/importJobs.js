import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name ImportJob
 * @memberof Schemas
 * @type {SimpleSchema}
 */
export const ImportJobs = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    label: "ID"
  },
  reference: {
    type: String,
    optional: true,
    label: "Import Reference"
  },
  collection: {
    type: String,
    optional: true,
    label: "Collection"
  },
  importMapping: {
    type: String,
    optional: true,
    label: "Mapping Template"
  }, // can be "default" or importMapping._id
  hasHeader: {
    type: Boolean,
    optional: true,
    label: "First row contains column names?"
  },
  shopId: {
    type: String,
    index: 1,
    label: "Shop"
  },
  userId: {
    type: String,
    optional: true,
    label: "User"
  },
  method: {
    type: String,
    optional: true,
    label: "Method"
  },
  status: {
    type: String,
    optional: true,
    label: "Status"
  }
});

registerSchema("ImportJobs", ImportJobs);
