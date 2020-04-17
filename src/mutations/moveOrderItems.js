import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { Order as OrderSchema } from "../simpleSchemas.js";
import updateGroupStatusFromItemStatus from "../util/updateGroupStatusFromItemStatus.js";
import updateGroupTotals from "../util/updateGroupTotals.js";

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
 * @returns {Promise<Object>} Object with `order` property containing the updated order
 */
export default async function moveOrderItems(context, input) {
  inputSchema.validate(input);

  const {
    fromFulfillmentGroupId,
    itemIds,
    orderId,
    toFulfillmentGroupId
  } = input;

  const {
    accountId: authAccountId,
    appEvents,
    collections,
    userId
  } = context;
  const { Orders } = collections;

  // First verify that this order actually exists
  const order = await Orders.findOne({ _id: orderId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  // Allow move if the account that placed the order is attempting to move
  await context.validatePermissions(`reaction:legacy:orders:${order._id}`, "move:item", {
    shopId: order.shopId,
    owner: order.accountId
  });

  // Is the account calling this mutation also the account that placed the order?
  // We need this check in a couple places below, so we'll get it here.
  const accountIsOrderer = (order.accountId && authAccountId === order.accountId);

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

  const { accountId, billingAddress, cartId, currencyCode } = order;

  // Find and move the items
  const orderSurcharges = [];
  const updatedGroups = await Promise.all(order.shipping.map(async (group) => {
    if (group._id !== fromFulfillmentGroupId && group._id !== toFulfillmentGroupId) return group;

    let updatedItems;
    if (group._id === fromFulfillmentGroupId) {
      // Remove the moved items
      updatedItems = group.items.filter((item) => !itemIds.includes(item._id));
    } else {
      // Add the moved items
      updatedItems = [...group.items, ...movedItems];
    }

    if (updatedItems.length === 0) {
      throw new ReactionError("invalid-param", "move would result in group having no items");
    }

    // Create an updated group
    const updatedGroup = {
      ...group,
      // There is a convenience itemIds prop, so update that, too
      itemIds: updatedItems.map((item) => item._id),
      items: updatedItems,
      totalItemQuantity: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    };

    // Update group shipping, tax, totals, etc.
    const { groupSurcharges } = await updateGroupTotals(context, {
      accountId,
      billingAddress,
      cartId,
      currencyCode,
      discountTotal: updatedGroup.invoice.discounts,
      group: updatedGroup,
      orderId,
      selectedFulfillmentMethodId: updatedGroup.shipmentMethod._id
    });

    // Push all group surcharges to overall order surcharge array.
    // Currently, we do not save surcharges per group
    orderSurcharges.push(...groupSurcharges);

    // Ensure proper group status
    updateGroupStatusFromItemStatus(updatedGroup);

    return updatedGroup;
  }));

  // We're now ready to actually update the database and emit events
  const modifier = {
    $set: {
      shipping: updatedGroups,
      surcharges: orderSurcharges,
      totalItemQuantity: updatedGroups.reduce((sum, group) => sum + group.totalItemQuantity, 0),
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
