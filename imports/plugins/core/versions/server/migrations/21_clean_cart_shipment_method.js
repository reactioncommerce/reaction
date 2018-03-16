import { Migrations } from "meteor/percolate:migrations";
import { Cart } from "/lib/collections";

// aldeed:simple-schema behavior would lead to a dangling incomplete shipmentMethod
// on new carts, but NPM simpl-schema now complains about that when validating.
Migrations.add({
  version: 21,
  up() {
    Cart.find().forEach((cart) => {
      const unset = {};

      (cart.shipping || []).forEach((shippingItem, index) => {
        const { shipmentMethod } = shippingItem;
        if (!shipmentMethod) return;
        if (Object.keys(shipmentMethod).length === 1) {
          unset[`shipping.${index}.shipmentMethod`] = 1;
        }
      });

      if (Object.keys(unset).length > 0) {
        Cart.update({ _id: cart._id }, { $unset: unset });
      }
    });
  }
});
