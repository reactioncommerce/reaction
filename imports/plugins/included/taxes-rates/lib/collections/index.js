import { Mongo } from "meteor/mongo";
import { Taxes as TaxesSchema } from "./schemas";

/**
 * @name Taxes
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Taxes = new Mongo.Collection("Taxes");

Taxes.attachSchema(TaxesSchema);
