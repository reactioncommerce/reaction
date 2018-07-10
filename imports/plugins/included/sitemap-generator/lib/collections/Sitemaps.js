import { Mongo } from "meteor/mongo";
import { SitemapsSchema } from "./schemas/SitemapsSchema";

/**
 * @name Sitemaps
 * @memberof Collections
 * @summary Collection for auto-generated XML sitemaps
 */
export const Sitemaps = new Mongo.Collection("Sitemaps");

// Create a compound index to support queries by shopId or shopId & handle
Sitemaps.rawCollection().createIndex({ shopId: 1, handle: 1 }, { background: true });

Sitemaps.attachSchema(SitemapsSchema);
