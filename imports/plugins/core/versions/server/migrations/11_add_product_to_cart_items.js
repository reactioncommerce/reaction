import { Migrations } from "meteor/percolate:migrations";
import { Cart, Orders, Products } from "/lib/collections";

Migrations.add({
  version: 11,
  up() {
    // Add whole product object to all cart items in all Cart documents if the cart has an item added
    Cart.find().forEach((cart) => {
      if (Array.isArray(cart.items) && cart.items.length) {
        cart.items.forEach((item) => {
          item.product = Products.findOne({ _id: item.productId });
        });
        Cart.update({ _id: cart._id }, {
          $set: { items: cart.items }
        }, { bypassCollection2: true });
      }
    });

    // Add whole product object to all order items in all order documents
    Orders.find().forEach((order) => {
      order.items.forEach((item) => {
        item.product = Products.findOne({ _id: item.productId });
      });
      Orders.update({ _id: order._id }, {
        $set: { items: order.items }
      }, { bypassCollection2: true });
    });
  },
  // Going down, we remove the product object on each item in cart and order
  down() {
    Cart.find().forEach((cart) => {
      if (Array.isArray(cart.items) && cart.items.length) {
        cart.items.forEach((item) => {
          delete item.product;
        });
        Cart.update({ _id: cart._id }, {
          $set: { items: cart.items }
        }, { bypassCollection2: true });
      }
    });

    Orders.find().forEach((order) => {
      order.items.forEach((item) => {
        delete item.product;
      });
      Orders.update({ _id: order._id }, {
        $set: { items: order.items }
      }, { bypassCollection2: true });
    });
  }
});
