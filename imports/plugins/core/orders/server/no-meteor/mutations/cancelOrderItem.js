import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import Random from "@reactioncommerce/random";
import { Order as OrderSchema } from "/imports/collections/schemas";

const canceledStatus = "coreOrderWorkflow/canceled";
const itemCanceledStatus = "coreOrderItemWorkflow/canceled";

// These should eventually be configurable in settings
const itemStatusesThatOrdererCanCancel = ["new"];
const orderStatusesThatOrdererCanCancel = ["new"];

const inputSchema = new SimpleSchema({
  cancelQuantity: {
    type: SimpleSchema.Integer,
    min: 1
  },
  itemId: String,
  orderId: String,
  reason: {
    type: String,
    optional: true
  }
});

/**
 * @method cancelOrderItem
 * @summary Cancels or partially cancels one order item
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<Object>} Object with `order` property containing the created order
 */
export default async function cancelOrderItem(context, input) {
  inputSchema.validate(input);

  const {
    orderId,
    itemId,
    cancelQuantity,
    reason = null
  } = input;

  const { accountId, appEvents, collections, isInternalCall, userHasPermission, userId } = context;
  const { Orders } = collections;

  const order = await Orders.findOne({ _id: orderId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  // Allowed if the account that placed the order is attempting to cancel
  // or if the account has "orders" permission.
  if (
    !isInternalCall &&
    (!accountId || accountId !== order.accountId) &&
    !userHasPermission(["orders"], order.shopId)
  ) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const accountIsOrderer = (order.accountId && accountId === order.accountId);

  if (accountIsOrderer && !orderStatusesThatOrdererCanCancel.includes(order.workflow.status)) {
    throw new ReactionError("invalid", `Order status (${order.workflow.status}) is not one of: ${orderStatusesThatOrdererCanCancel.join(", ")}`);
  }

  // Find and cancel the item
  let foundItem = false;
  const updatedGroups = order.shipping.map((group) => {
    let itemToAdd;
    const updatedItems = group.items.map((item) => {
      if (item._id !== itemId) return item;
      foundItem = true;

      if (accountIsOrderer && !itemStatusesThatOrdererCanCancel.includes(item.workflow.status)) {
        throw new ReactionError("invalid", `Item status (${item.workflow.status}) is not one of: ${itemStatusesThatOrdererCanCancel.join(", ")}`);
      }

      if (item.quantity > cancelQuantity) {
        itemToAdd = {
          ...item,
          _id: Random.id(),
          quantity: item.quantity - cancelQuantity
        };
      } else if (item.quantity < cancelQuantity) {
        throw new ReactionError("invalid-param", "cancelQuantity may not be greater than item quantity");
      }

      return {
        ...item,
        cancelReason: reason,
        quantity: cancelQuantity,
        workflow: {
          status: itemCanceledStatus,
          workflow: [...item.workflow.workflow, itemCanceledStatus]
        }
      };
    });

    if (itemToAdd) {
      updatedItems.push(itemToAdd);
    }

    // If all items are canceled, set the group status to canceled
    let updatedGroupWorkflow = group.workflow;
    const allItemsAreCanceled = updatedItems.every((item) => item.workflow.status === itemCanceledStatus);
    if (allItemsAreCanceled && updatedGroupWorkflow.status !== canceledStatus) {
      updatedGroupWorkflow = {
        status: canceledStatus,
        workflow: [...updatedGroupWorkflow.workflow, canceledStatus]
      };
    }

    return { ...group, items: updatedItems, workflow: updatedGroupWorkflow };
  });

  if (!foundItem) throw new ReactionError("not-found", "Order item not found");

  // If all groups are canceled, set the order status to canceled
  let updatedOrderWorkflow = order.workflow;
  let fullOrderWasCanceled = false;
  const allGroupsAreCanceled = updatedGroups.every((group) => group.workflow.status === canceledStatus);
  if (allGroupsAreCanceled && updatedOrderWorkflow.status !== canceledStatus) {
    updatedOrderWorkflow = {
      status: canceledStatus,
      workflow: [...updatedOrderWorkflow.workflow, canceledStatus]
    };
    fullOrderWasCanceled = true;
  }

  const modifier = {
    $set: {
      shipping: updatedGroups,
      updatedAt: new Date(),
      workflow: updatedOrderWorkflow
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

  if (fullOrderWasCanceled) {
    await appEvents.emit("afterOrderCancel", {
      cancelledBy: userId,
      order: updatedOrder
    });
  }

  return { order: updatedOrder };
}
