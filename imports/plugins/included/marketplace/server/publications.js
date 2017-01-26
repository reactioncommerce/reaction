import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";
import { SellerShops } from "../lib/collections";

Meteor.publish("SellerShops", function () {
  const _id = Reaction.getSellerShopId(this.userId);

  // Publish a subset of Shops collection to a client-only SellerShops collection.
  // This way we keep the Shops collection on the client with just one "parent" shop
  Mongo.Collection._publishCursor(Shops.find({ _id }), this, "SellerShops");
  this.ready();
});
