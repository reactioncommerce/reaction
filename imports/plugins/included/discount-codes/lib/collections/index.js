// import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";
/**
* DiscountCodes Collection
* @type {Object}
* @desc Collection for DiscountCodes
* use this collection for saving discount codes that if
* applied to an order apply a discount rate from the
* discounts collection, with rules applied.
*/
// export const DiscountCodes = new Mongo.Collection("DiscountCodes");

// Discounts.attachSchema(Schemas.DiscountCodes);

Discounts.attachSchema(Schemas.DiscountCodes, {selector: {discountMethod: "code"}});
