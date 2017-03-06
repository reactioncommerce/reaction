import { SellerShop } from "./schemas";
/**
 * SellerShops Collection
 */
export const SellerShops = new Mongo.Collection("SellerShops");

SellerShops.attachSchema(SellerShop);
