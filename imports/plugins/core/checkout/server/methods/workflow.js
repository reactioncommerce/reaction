import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Orders } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/* eslint no-shadow: 0 */

/**
 * @file Methods for Workflow. Run these methods using `Meteor.call()`.
 * @example Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "checkoutLogin");
 *
 * @namespace Workflow/Methods
 */

Meteor.methods({
  /**
   * @name workflow/pushOrderWorkflow
   * @summary Update the order workflow: Push the status as the current workflow step,
   * move the current status to completed workflow steps
   *
   * @description Step 1 meteor call to push a new workflow
   * Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", this);
   * NOTE: "coreOrderWorkflow", "processing" will be combined into "coreOrderWorkflow/processing" and set as the status
   * Step 2 (this method) of the "workflow/pushOrderWorkflow" flow; Try to update the current status
   *
   * @method
   * @memberof Workflow/Methods
   * @param  {String} workflow workflow to push to
   * @param  {String} status - Workflow status
   * @param  {Order} order - Schemas.Order, an order object
   * @return {Boolean} true if update was successful
   */
  "workflow/pushOrderWorkflow"(workflow, status, order) {
    check(workflow, String);
    check(status, String);
    check(order, Match.ObjectIncluding({
      _id: String,
      shopId: String
    }));
    this.unblock();

    if (!Reaction.hasPermission("orders", Reaction.getUserId(), order.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // Combine (workflow) "coreOrderWorkflow", (status) "processing" into "coreOrderWorkflow/processing".
    // This combination will be used to call the method "workflow/coreOrderWorkflow/processing", if it exists.
    const workflowStatus = `${workflow}/${status}`;

    const result = Orders.update({
      _id: order._id,
      // Necessary to query on shop ID too, so they can't pass in a different ID for permission check
      shopId: order.shopId
    }, {
      $set: {
        "workflow.status": workflowStatus
      },
      $addToSet: {
        "workflow.workflow": workflowStatus
      }
    });
    if (result !== 1) {
      throw new ReactionError("server-error", "Unable to update order");
    }

    const updatedOrder = Orders.findOne({ _id: order._id });
    Promise.await(appEvents.emit("afterOrderUpdate", {
      order: updatedOrder,
      updatedBy: Reaction.getUserId()
    }));

    return result;
  }
}
