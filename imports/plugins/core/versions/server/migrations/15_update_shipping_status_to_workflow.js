import { Migrations } from "meteor/percolate:migrations";
import { Orders } from "/lib/collections";

Migrations.add({
  version: 15,
  // Reaction v1.0 had 3 shipping boolean states (packed, shipped, delivered). Shipping workflow is not managed with a
  // workflow object that keeps track of previous state.
  up() {
    Orders.find().forEach((order) => {
      const currentShipping = order.shipping[0];
      currentShipping.workflow = {};

      if (currentShipping.packed) {
        currentShipping.workflow.status = "coreOrderWorkflow/packed";
        currentShipping.workflow.workflow = [
          "coreOrderWorkflow/notStarted",
          "coreOrderWorkflow/picked",
          "coreOrderWorkflow/packed"
        ];
      }

      if (currentShipping.shipped) {
        currentShipping.workflow.status = "coreOrderWorkflow/shipped";
        currentShipping.workflow.workflow = [
          "coreOrderWorkflow/notStarted",
          "coreOrderWorkflow/picked",
          "coreOrderWorkflow/packed",
          "coreOrderWorkflow/labeled",
          "coreOrderWorkflow/shipped"
        ];
      }

      if (currentShipping.delivered) {
        currentShipping.workflow.status = "coreOrderWorkflow/delivered";
        currentShipping.workflow.workflow = [
          "coreOrderWorkflow/notStarted",
          "coreOrderWorkflow/picked",
          "coreOrderWorkflow/packed",
          "coreOrderWorkflow/labeled",
          "coreOrderWorkflow/shipped",
          "coreOrderWorkflow/delivered"
        ];
      }

      // If none of the 3 v1.0 states is true, set as unstarted.
      // Note: In case of customized workflow status, modify here to capture the added status(es) before running the migration
      currentShipping.workflow.status = "new";
      currentShipping.workflow.workflow = ["coreOrderWorkflow/notStarted"];

      delete currentShipping.packed;
      delete currentShipping.shipped;
      delete currentShipping.delivered;

      Orders.update({ _id: order._id }, {
        $set: { "shipping.0": currentShipping }
      }, { bypassCollection2: true });
    });
  },
  down() {
    Orders.find().forEach((order) => {
      const currentShipping = order.shipping[0];
      const { workflow } = currentShipping;

      currentShipping.packed = false;
      currentShipping.shipped = false;
      currentShipping.delivered = false;

      if (workflow && workflow.status === "coreOrderWorkflow/packed") {
        currentShipping.packed = true;
      }

      if (workflow && workflow.status === "coreOrderWorkflow/shipped") {
        currentShipping.shipped = true;
      }

      if (workflow && workflow.status === "coreOrderWorkflow/delivered") {
        currentShipping.delivered = true;
      }

      delete currentShipping.workflow.workflow;

      Orders.update({ _id: order._id }, {
        $set: { "shipping.0": currentShipping }
      }, { bypassCollection2: true });
    });
  }
});

