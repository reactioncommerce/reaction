import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";

/**
* ReactionCore Collections TaxCodes
*/

/**
* Taxes Collection
*/
export const Taxes = new Mongo.Collection("Taxes");

Taxes.attachSchema(Schemas.Taxes);


/**
* TaxCodes Collection
*/
export const TaxCodes = new Mongo.Collection("TaxCodes");

TaxCodes.attachSchema(Schemas.TaxCodes);
