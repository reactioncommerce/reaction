const canceledStatus = "coreOrderWorkflow/canceled";
const itemCanceledStatus = "coreOrderItemWorkflow/canceled";

/**
 * @summary Given a fulfillment group, determines and set the correct
 *   current status on it based on the status of all the items in the
 *   group. Mutates the group object if necessary
 * @param {Object} group An order fulfillment group
 * @returns {undefined}
 */
export default function updateGroupStatusFromItemStatus(group) {
  // If all items are canceled, set the group status to canceled
  const allItemsAreCanceled = group.items.every((item) => item.workflow.status === itemCanceledStatus);
  if (allItemsAreCanceled && group.workflow.status !== canceledStatus) {
    group.workflow = {
      status: canceledStatus,
      workflow: [...group.workflow.workflow, canceledStatus]
    };
  }
}
