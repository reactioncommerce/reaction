import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";

/**
 * @name ImportJobs
 * @memberof Collections
 * @type {MongoCollection}
 */
export const ImportJobs = new Mongo.Collection("ImportJobs");

ImportJobs.attachSchema(Schemas.ImportJobs);

/**
 * @name ImportMappings
 * @memberof Collections
 * @type {MongoCollection}
 */
export const ImportMappings = new Mongo.Collection("ImportMappings");

ImportMappings.attachSchema(Schemas.ImportMappings);
