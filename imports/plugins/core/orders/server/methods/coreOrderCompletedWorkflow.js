import _ from "lodash";
import { check, Match } from "meteor/check";

/**
 * @name coreOrderWorkflow/coreOrderCompleted
 * @method
 * @memberof Workflow/Methods
 * @summary Performs various checks to determine if an order may be moved into the completed phase.
 * @description Step 4 of the "workflow/pushOrderWorkflow" flow - called from Orders.before.update hook.
 * @param  {Object} options An object containing arbitrary data
 * @return {Boolean} true to allow action, false to cancel execution of hook
 * @see packages/reaction-schema/common/hooks/orders.js
 * @see packages/reaction-core/common/methods/workflow.js
 */
export default function coreOrderCompletedWorkflow(options) {
  check(options, Match.OrderHookOptions());

  const { order } = options;

  const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
  const result = _.every(orderItems, (item) => _.includes(item.workflow.workflow, "coreOrderItemWorkflow/completed"));

  return result;
}
