import { Mongo } from "meteor/mongo";
import { Schemas } from "@reactioncommerce/reaction-collections";

/**
 * Client side collections
 */
export const DiscountCodes = new Mongo.Collection("DiscountCodes");
// attach discount code specific schema
DiscountCodes.attachSchema(Schemas.DiscountCodes);
