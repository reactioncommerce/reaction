import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";

/**
 * @name Taxes
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Taxes = new Mongo.Collection("Taxes");

Taxes.attachSchema(Schemas.Taxes);

/**
 * @name TaxCodes
 * @memberof Collections
 * @type {MongoCollection}
 */
export const TaxCodes = new Mongo.Collection("TaxCodes");

TaxCodes.attachSchema(Schemas.TaxCodes);
