import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";


/**
 *  Step 4 of the "workflow/pushOrderWorkflow" flow
 *	The following methods are called from Orders.before.update hook.
 *
 *	@see packages/reaction-schema/common/hooks/orders.js
 *	@see packages/reaction-core/common/methods/workflow.js
 */
Meteor.methods({
  /**
   * workflow/coreOrderWorkflow/coreOrderProcessing
   * Workflow method that checks permissions for a given user to allow them to
   * move an order into the processing phase.
   * @param  {Object} options An object containing arbitary data
   * @return {Boolean} true to allow action, false to cancel execution of hook
   */
  "workflow/coreOrderWorkflow/coreOrderProcessing": function (options) {
    check(options, Match.OrderHookOptions());
    const userId = options.userId;

    return Reaction.hasPermission(["dashboard/orders"], userId);
  },

  /**
   * workflow/coreOrderWorkflow/coreOrderCompleted
   * Workflow method that performs verios check to determine if an order may be
   * moved into the completed phase.
   * @param  {Object} options An object containing arbitary data
   * @return {Boolean} true to allow action, false to cancel execution of hook
   */
  "workflow/coreOrderWorkflow/coreOrderCompleted": function (options) {
    check(options, Match.OrderHookOptions());

    const order = options.order;

    const result = _.every(order.items, (item) => {
      return _.includes(item.workflow.workflow, "coreOrderItemWorkflow/completed");
    });

    return result;
  }
});
