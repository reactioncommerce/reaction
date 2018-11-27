import { Migrations } from "meteor/percolate:migrations";
import { Cart } from "/lib/collections";

/**
 * Going up, adds type
 * Going down, removes type
 */

Migrations.add({
  version: 35,
  up() {
    Cart.find({}).forEach((cart) => {
      const shipping = (cart.shipping || []).map((group) => ({
        ...group,
        type: "shipping"
      }));

      Cart.update({ _id: cart._id }, {
        $set: {
          shipping
        }
      }, { bypassCollection2: true });
    });
  },
  down() {
    Cart.find({}).forEach((cart) => {
      const shipping = (cart.shipping || []).map((group) => {
        delete group.type;
        return group;
      });

      Cart.update({ _id: cart._id }, {
        $set: {
          shipping
        }
      }, { bypassCollection2: true });
    });
  }
});
