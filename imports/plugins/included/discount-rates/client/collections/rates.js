import { Mongo } from "meteor/mongo";
import { DiscountRates as DiscountSchema } from "../../lib/collections/schemas";

/**
 * @name DiscountRates
 * @memberof Collections/ClientOnly
 * @type {MongoCollection}
 */
export const DiscountRates = new Mongo.Collection("DiscountRates");
// attach discount code specific schema
DiscountRates.attachSchema(DiscountSchema);
