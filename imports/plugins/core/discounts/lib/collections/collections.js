import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";

/**
* Discounts Collection
* @type {Object}
* @desc Collection for custom discount rates
* for dollar, percentage, and shipping
* discount rates.
*/
export const Discounts = new Mongo.Collection("Discounts");

Discounts.attachSchema(Schemas.Discounts);
