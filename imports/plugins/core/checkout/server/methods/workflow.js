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
  },

  /**
   * @name workflow/pushItemWorkflow
   * @method
   * @memberof Workflow/Methods
   * @param  {String} status  Workflow status
   * @param  {Object} order   Schemas.Order, an order object
   * @param  {String[]} itemIds Array of item IDs
   * @return {Boolean}         true if update was successful
   */
  "workflow/pushItemWorkflow"(status, order, itemIds) {
    check(status, String);
    check(order, Match.ObjectIncluding({
      _id: String,
      shopId: String
    }));
    check(itemIds, Array);

    if (!Reaction.hasPermission("orders", Reaction.getUserId(), order.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // We can't trust the order from the client (for several reasons)
    // Initially because in a multi-merchant scenario, the order from the client
    // will contain only the items associated with their shop
    // We'll get the order from the db that has all the items

    const dbOrder = Orders.findOne({ _id: order._id });

    const shipping = dbOrder.shipping.map((group) => {
      const items = group.items.map((item) => {
        // Don't modify items unless they in our itemIds array
        if (!itemIds.includes(item._id)) {
          return item;
        }

        // Add the current status to completed workflows
        if (item.workflow.status !== "new") {
          const workflows = item.workflow.workflow || [];

          workflows.push(status);
          item.workflow.workflow = _.uniq(workflows);
        }

        // Set the new item status
        item.workflow.status = status;
        return item;
      });
      return {
        ...group,
        items
      };
    });

    const result = Orders.update({
      _id: dbOrder._id,
      // Necessary to query on shop ID too, so they can't pass in a different ID for permission check
      shopId: order.shopId
    }, {
      $set: {
        shipping
      }
    });
    if (result !== 1) {
      throw new ReactionError("server-error", "Unable to update order");
    }

    Promise.await(appEvents.emit("afterOrderUpdate", {
      order: {
        ...dbOrder,
        shipping
      },
      updatedBy: Reaction.getUserId()
    }));

    return result;
  }
});
