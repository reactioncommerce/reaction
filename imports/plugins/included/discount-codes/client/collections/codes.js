import { Mongo } from "meteor/mongo";
import { Schemas } from "@reactioncommerce/reaction-collections";

const DiscountSchema = Schemas.DiscountCodes;

/**
 * Client side collections
 */
export const DiscountCodes = new Mongo.Collection("DiscountCodes");
// attach discount code specific schema
DiscountCodes.attachSchema(DiscountSchema);
