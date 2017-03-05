import * as Schemas from "/lib/collections/schemas";

/**
 * SellerShops Collection
 */
export const SellerShops = new Mongo.Collection("SellerShops");

SellerShops.attachSchema(Schemas.SellerShop);
