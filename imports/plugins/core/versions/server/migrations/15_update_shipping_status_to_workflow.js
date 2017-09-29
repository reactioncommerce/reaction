import { Migrations } from "meteor/percolate:migrations";
import { Orders } from "/lib/collections";

Migrations.add({
  version: 15,
  // Reaction v1.0 had 3 shipping boolean states (packed, shipped, delivered). Shipping workflow is not managed with a
  // workflow object that keeps track of previous state.
  up: function () {
    Orders.find().forEach((order) => {
      const currentShipping = order.shipping[0];
      currentShipping.workflow = {};

      if (currentShipping.packed) {
        currentShipping.workflow.status = "coreOrderWorkflow/packed";
        currentShipping.workflow.workflow = ["coreOrderWorkflow/notStarted"];
      }

      if (currentShipping.shipped) {
        currentShipping.workflow.status = "coreOrderWorkflow/shipped";
        currentShipping.workflow.workflow = [
          "coreOrderWorkflow/notStarted", "coreOrderWorkflow/packed"
        ];
      }

      if (currentShipping.delivered) {
        currentShipping.workflow.status = "coreOrderWorkflow/delivered";
        currentShipping.workflow.workflow = [
          "coreOrderWorkflow/notStarted", "coreOrderWorkflow/packed", "coreOrderWorkflow/shipped"
        ];
      }

      // If none of the 3 v1.0 states is true, set as unstarted.
      // Note: In case of customized workflow status, modify here to capture the added status(es) before running the migration
      currentShipping.workflow.status = "coreOrderWorkflow/notStarted";
      currentShipping.workflow.workflow = [];

      delete currentShipping.packed;
      delete currentShipping.shipped;
      delete currentShipping.delivered;

      Orders.update({ _id: order._id }, {
        $set: { "shipping.0": currentShipping }
      });
    });
  },
  down: function () {
    // Orders.find().forEach((order) => {
    //   const currentShipping = order.shipping[0];

    // });
  }
});

