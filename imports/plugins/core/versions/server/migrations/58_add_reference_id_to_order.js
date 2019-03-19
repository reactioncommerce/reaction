import { Migrations } from "meteor/percolate:migrations";
import * as collections from "/lib/collections";


Migrations.add({
  version: 58,
  up() {
    // In case any orders don't have a reference ID
    collections.Orders.find({ "referenceId" : { "$exists" : false }}).forEach((order) => {
      collections.Orders.findOneAndUpdate({ _id: order._id }, { $set: { referenceId: order._id }})
    });

    // In case we have existing carts
    collections.Cart.find({ "referenceId" : { "$exists" : false }}).forEach((cart) => {
      collections.Cart.findOneAndUpdate({ _id: cart._id }, { $set: { referenceId: cart._id }})
    })
  }
});
