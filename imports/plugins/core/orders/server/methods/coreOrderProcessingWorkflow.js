import { check, Match } from "meteor/check";
import Reaction from "/server/api/core";

/**
 * @name coreOrderWorkflow/coreOrderProcessing
 * @method
 * @memberof Workflow/Methods
 * @summary Checks permissions for a given user to allow them to move an order into the processing phase.
 * @description Step 4 of the "workflow/pushOrderWorkflow" flow - called from Orders.before.update hook.
 * @param  {Object} options An object containing arbitrary data
 * @return {Boolean} true to allow action, false to cancel execution of hook
 * @see packages/reaction-schema/common/hooks/orders.js
 * @see packages/reaction-core/common/methods/workflow.js
 */
export default function coreOrderProcessingWorkflow(options) {
  check(options, Match.OrderHookOptions());
  const { userId } = options;

  return Reaction.hasPermission(["dashboard/orders"], userId);
}
