import { Mongo } from "meteor/mongo";
import { TaxCodes as TaxCodesSchema } from "./schemas";

/**
 * @name TaxCodes
 * @memberof Collections
 * @type {MongoCollection}
 */
export const TaxCodes = new Mongo.Collection("TaxCodes");

TaxCodes.attachSchema(TaxCodesSchema);
