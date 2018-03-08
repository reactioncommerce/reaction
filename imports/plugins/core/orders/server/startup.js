import { Meteor } from "meteor/meteor";
import { Hooks } from "/server/api";
import { AnalyticsEvents } from "/lib/collections";


Hooks.Events.add("afterOrderInsert", (order) => {
  const analyticsEvent = {
    eventType: "buy",
    value: order._id,
    label: "bought products"
  };
  AnalyticsEvents.insert(analyticsEvent);

  return order;
});

/**
*  Step 3 of the "workflow/pushOrderWorkflow" flow
*
*  The following methods are called from Orders.before.update hook.
*  @see packages/reaction-schema/common/hooks/orders.js
*  @see packages/reaction-core/common/methods/workflow.js
*/

/**
 * Orders collection before update
 * @param {String} userId - User wanting to update this documen
 * @param {Order} order - Order object, before any modifications
 * @param {Array} fieldNames - Array of field names to update
 * @param {Object} modifier - Mongo modifier object
 * @return {Boolean} true if document should be updated, false otherwise
*/
// NOTE: The workflow method ends up being set to 'workflow/coreOrderWorkflow/processing'
// Which does not exist as a meteor server handler. This methods does hooks as it 
// is does not accomplish anything, perhaps it could be removed.
Hooks.Events.add("beforeUpdateOrderWorkflow", (order, options) => {
  const { userId, modifier } = options;
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
