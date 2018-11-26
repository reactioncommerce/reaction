import { Migrations } from "meteor/percolate:migrations";
import { Orders } from "/lib/collections";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

Migrations.add({
  version: 47,

  up() {
    findAndConvertInBatches({
      collection: Orders,
      converter: (order) => {
        if (!order.referenceId) order.referenceId = order._id;
        return order;
      }
    });
  },

  down() {
    Orders.update({
      referenceId: { $exists: true }
    }, {
      $unset: {
        referenceId: ""
      }
    }, { bypassCollection2: true });
  }
});
