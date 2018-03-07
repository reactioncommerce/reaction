import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction } from "/server/api";

Meteor.methods({
  /**
   * @name coreOrderWorkflow/coreOrderProcessing
   * @method
   * @memberof Methods/Workflow
   * @summary Checks permissions for a given user to allow them to move an order into the processing phase.
   * @description Step 4 of the "workflow/pushOrderWorkflow" flow - called from Orders.before.update hook.
   * @param  {Object} options An object containing arbitary data
   * @return {Boolean} true to allow action, false to cancel execution of hook
   * @see packages/reaction-schema/common/hooks/orders.js
   * @see packages/reaction-core/common/methods/workflow.js
   */
  "workflow/coreOrderWorkflow/coreOrderProcessing"(options) {
    check(options, Match.OrderHookOptions());
    const { userId } = options;

    return Reaction.hasPermission(["dashboard/orders"], userId);
  },

  /**
   * @name coreOrderWorkflow/coreOrderCompleted
   * @method
   * @memberof Methods/Workflow
   * @summary Performs various checks to determine if an order may be moved into the completed phase.
   * @description Step 4 of the "workflow/pushOrderWorkflow" flow - called from Orders.before.update hook.
   * @param  {Object} options An object containing arbitary data
   * @return {Boolean} true to allow action, false to cancel execution of hook
   * @see packages/reaction-schema/common/hooks/orders.js
   * @see packages/reaction-core/common/methods/workflow.js
   */
  "workflow/coreOrderWorkflow/coreOrderCompleted"(options) {
    check(options, Match.OrderHookOptions());

    const { order } = options;

    const result = _.every(order.items, (item) => _.includes(item.workflow.workflow, "coreOrderItemWorkflow/completed"));

    return result;
  }
});
