import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";

/**
 * @name Discounts
 * @memberof Collections
 * @summary Collection for custom discount rates for dollar, percentage, and shipping discount rates.
 * @type {MongoCollection}
 */
export const Discounts = new Mongo.Collection("Discounts");

Discounts.attachSchema(Schemas.Discounts);
