import * as Schemas from "./schemas";

/**
 * SellerShops Collection
 */
export const SellerShops = new Mongo.Collection("SellerShops");

SellerShops.attachSchema(Schemas.Shop);
