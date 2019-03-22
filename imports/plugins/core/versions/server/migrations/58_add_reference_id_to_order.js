import { Migrations } from "meteor/percolate:migrations";
import { Cart } from "/lib/collections";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

Migrations.add({
  version: 58,

  up() {
    findAndConvertInBatches({
      collection: Cart,
      converter: (cart) => {
        if (!cart.referenceId) cart.referenceId = cart._id;
        return cart;
      }
    });
  },

  down() {
    Cart.update({
      referenceId: { $exists: true }
    }, {
      $unset: {
        referenceId: ""
      }
    }, { bypassCollection2: true });
  }
});
