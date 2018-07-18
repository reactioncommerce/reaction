import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/schemas";

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
