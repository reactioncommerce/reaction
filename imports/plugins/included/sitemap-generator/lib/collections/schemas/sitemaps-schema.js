import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";

/**
 * @name SitemapsSchema
 * @memberof Schemas
 * @summary Schema for Sitemaps collection
 * @type {SimpleSchema}
 */
export const SitemapsSchema = new SimpleSchema({
  shopId: {
    type: String
  },
  handle: {
    type: String
  },
  xml: {
    type: String
  },
  createdAt: {
    type: Date
  }
}, { check, tracker: Tracker });

registerSchema("Sitemaps", SitemapsSchema);
