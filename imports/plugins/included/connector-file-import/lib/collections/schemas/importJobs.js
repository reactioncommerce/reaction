import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name ImportJob
 * @memberof Schemas
 * @type {SimpleSchema}
 */
export const ImportJobs = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "collection": {
    type: String,
    label: "Collection"
  },
  "method": {
    type: String,
    optional: true
  },
  "status": {
    type: String,
    optional: true
  }
});

registerSchema("ImportJobs", ImportJobs);
