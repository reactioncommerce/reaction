import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { Order as OrderSchema } from "/imports/collections/schemas";

// These should eventually be configurable in settings
const itemStatusesThatOrdererCanMove = ["new"];
const orderStatusesThatOrdererCanMove = ["new"];

const inputSchema = new SimpleSchema({
  "fromFulfillmentGroupId": String,
  "itemIds": {
    type: Array,
    minCount: 1
  },
  "itemIds.$": String,
  "orderId": String,
  "toFulfillmentGroupId": String
});

/**
 * @method moveOrderItems
 * @summary Use this mutation to move one or more items between existing order
 *   fulfillment groups.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<Object>} Object with `order` property containing the updated order
 */
export default async function moveOrderItems(context, input) {
  inputSchema.validate(input);

  const {
    fromFulfillmentGroupId,
    itemIds,
    orderId,
    toFulfillmentGroupId
  } = input;

  const { accountId, appEvents, collections, isInternalCall, userHasPermission, userId } = context;
  const { Orders } = collections;

  // First verify that this order actually exists
  const order = await Orders.findOne({ _id: orderId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  // Allow move if the account that placed the order is attempting to move
  // or if the account has "orders" permission. When called internally by another
  // plugin, context.isInternalCall can be set to `true` to disable this check.
  if (
    !isInternalCall &&
    (!accountId || accountId !== order.accountId) &&
    !userHasPermission(["orders"], order.shopId)
  ) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Is the account calling this mutation also the account that placed the order?
  // We need this check in a couple places below, so we'll get it here.
  const accountIsOrderer = (order.accountId && accountId === order.accountId);

  // The orderer may only move items while the order status is still "new"
  if (accountIsOrderer && !orderStatusesThatOrdererCanMove.includes(order.workflow.status)) {
    throw new ReactionError("invalid", `Order status (${order.workflow.status}) is not one of: ${orderStatusesThatOrdererCanMove.join(", ")}`);
  }

  // Find the two fulfillment groups we're modifying
  const fromGroup = order.shipping.find((group) => group._id === fromFulfillmentGroupId);
  if (!fromGroup) throw new ReactionError("not-found", "Order fulfillment group (from) not found");

  const toGroup = order.shipping.find((group) => group._id === toFulfillmentGroupId);
  if (!toGroup) throw new ReactionError("not-found", "Order fulfillment group (to) not found");

  // Pull out the item's we're moving
  const foundItemIds = [];
  const movedItems = fromGroup.items.reduce((list, item) => {
    if (itemIds.includes(item._id)) {
      // The orderer may only move while the order item status is still "new"
      if (accountIsOrderer && !itemStatusesThatOrdererCanMove.includes(item.workflow.status)) {
        throw new ReactionError("invalid", `Item status (${item.workflow.status}) is not one of: ${itemStatusesThatOrdererCanMove.join(", ")}`);
      }

      list.push(item);
      foundItemIds.push(item._id);
    }
    return list;
  }, []);

  if (!itemIds.every((id) => foundItemIds.includes(id))) {
    throw new ReactionError("not-found", "Some order items not found");
  }

  // Find and move the items
  const updatedGroups = order.shipping.map((group) => {
    if (group._id === fromFulfillmentGroupId) {
      // Return group items with the moved items removed
      return {
        ...group,
        items: group.items.filter((item) => !itemIds.includes(item._id))
      };
    }

    if (group._id === toFulfillmentGroupId) {
      // Return group items with the moved items added
      return {
        ...group,
        items: [...group.items, ...movedItems]
      };
    }

    return group;
  });

  // We're now ready to actually update the database and emit events
  const modifier = {
    $set: {
      shipping: updatedGroups,
      updatedAt: new Date()
    }
  };

  OrderSchema.validate(modifier, { modifier: true });

  const { modifiedCount, value: updatedOrder } = await Orders.findOneAndUpdate(
    { _id: orderId },
    modifier,
    { returnOriginal: false }
  );
  if (modifiedCount === 0 || !updatedOrder) throw new ReactionError("server-error", "Unable to update order");

  await appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: userId
  });

  return { order: updatedOrder };
}
