import { Mongo } from "meteor/mongo";
import { DiscountCodes as DiscountSchema } from "../../lib/collections/schemas";


/**
 * Client side collections
 */
export const DiscountCodes = new Mongo.Collection("DiscountCodes");
// attach discount code specific schema
DiscountCodes.attachSchema(DiscountSchema);
