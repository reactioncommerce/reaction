import { Mongo } from "meteor/mongo";

/**
 * @name ProductSearch
 * @memberof Collections
 * @type {MongoCollection}
 */
export const ProductSearch = new Mongo.Collection("ProductSearch");

/**
 * @name OrderSearch
 * @memberof Collections
 * @type {MongoCollection}
 */
export const OrderSearch = new Mongo.Collection("OrderSearch");

/**
 * @name AccountSearch
 * @memberof Collections
 * @type {MongoCollection}
 */
export const AccountSearch = new Mongo.Collection("AccountSearch");
