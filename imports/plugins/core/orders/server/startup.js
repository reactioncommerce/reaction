import { AnalyticsEvents, Orders } from "/lib/collections";


Orders.before.insert((userId, order) => {
  const analyticsEvent = {
    eventType: "buy",
    value: order._id,
    label: "bought products"
  };
  AnalyticsEvents.insert(analyticsEvent);
});

/**
*  Step 3 of the "workflow/pushOrderWorkflow" flow
*
*	The following methods are called from Orders.before.update hook.
*	@see packages/reaction-schema/common/hooks/orders.js
  * @see packages/reaction-core/common/methods/workflow.js
*/

/**
 * Orders collection before update
 * @param {String} userId - User wanting to update this documen
 * @param {Order} order - Order object, before any modifications
 * @param {Array} fieldNames - Array of field names to update
 * @param {Object} modifier - Mongo modifier object
 * @return {Boolean} true if document should be updated, false otherwise
*/
Orders.before.update((userId, order, fieldNames, modifier) => {
  // if we're adding a new product or variant to the cart
  if (modifier.$set) {
    // Updating status of order e.g. "coreOrderWorkflow/processing"
    if (modifier.$set["workflow.status"]) {
      const status = modifier.$set["workflow.status"];
      const workflowMethod = `workflow/${status}`;

      if (Meteor.server.method_handlers[workflowMethod]) {
        const result = Meteor.call(workflowMethod, {
          userId,
          order,
          modifier
        });
        // Result should be true / false to all or disallow updating the status
        return result;
      }
    }
  }
});
