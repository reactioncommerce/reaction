import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import Random from "@reactioncommerce/random";
import updateGroupStatusFromItemStatus from "../util/updateGroupStatusFromItemStatus.js";
import updateGroupTotals from "../util/updateGroupTotals.js";
import { Order as OrderSchema } from "../simpleSchemas.js";

/**
 * @name inputSchema
 * @private
 * @type {SimpleSchema}
 * @property {String} itemId The order item ID to split into two items
 * @property {Number} newItemQuantity The quantity that will be transferred to a new
 *   order item on the same fulfillment group.
 * @property {String} orderId The order ID
 */
const inputSchema = new SimpleSchema({
  itemId: String,
  newItemQuantity: {
    type: SimpleSchema.Integer,
    min: 1
  },
  orderId: String
});

/**
 * @method splitOrderItem
 * @summary Use this mutation to reduce the quantity of one item of an order and create
 *   a new item for the remaining quantity in the same fulfillment group, and with the
 *   same item status. You may want to do this if you are only able to partially fulfill
 *   the item order right now.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @returns {Promise<Object>} Object with `order` property containing the created order
 *   and `newItemId` property set to the ID of the new item
 */
export default async function splitOrderItem(context, input) {
  inputSchema.validate(input);

  const {
    itemId,
    orderId,
    newItemQuantity
  } = input;

  const { appEvents, collections, userId } = context;
  const { Orders } = collections;

  // First verify that this order actually exists
  const order = await Orders.findOne({ _id: orderId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  // Allow split if the account has "orders" permission
  await context.validatePermissions(
    `reaction:legacy:orders:${order._id}`,
    "move:item",
    { shopId: order.shopId }
  );

  const { accountId, billingAddress, cartId, currencyCode } = order;

  // Find and split the item
  let foundItem = false;
  const newItemId = Random.id();
  const orderSurcharges = [];
  const updatedGroups = await Promise.all(order.shipping.map(async (group) => {
    let itemToAdd;
    const updatedItems = group.items.map((item) => {
      if (item._id !== itemId) return item;

      if (item.quantity <= newItemQuantity) {
        throw new ReactionError("invalid-param", "quantity must be less than current item quantity");
      }

      foundItem = true;

      // The modified item to be created
      itemToAdd = {
        ...item,
        _id: newItemId,
        quantity: newItemQuantity,
        subtotal: item.price.amount * newItemQuantity
      };

      const updatedItemQuantity = item.quantity - newItemQuantity;
      const updatedItemSubtotal = item.price.amount * updatedItemQuantity;

      // The modified original item being split
      return {
        ...item,
        quantity: updatedItemQuantity,
        subtotal: updatedItemSubtotal
      };
    });

    if (!itemToAdd) return group;

    updatedItems.push(itemToAdd);

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

  // If we did not find any matching item ID while looping, something is wrong
  if (!foundItem) throw new ReactionError("not-found", "Order item not found");

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

  return { newItemId, order: updatedOrder };
}
