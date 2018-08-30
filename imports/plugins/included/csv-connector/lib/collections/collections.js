import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";

/**
 * @name JobItems
 * @memberof Collections
 * @type {MongoCollection}
 */
export const JobItems = new Mongo.Collection("JobItems");

JobItems.attachSchema(Schemas.JobItems);

/**
 * @name Mappings
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Mappings = new Mongo.Collection("Mappings");

Mappings.attachSchema(Schemas.Mappings);
