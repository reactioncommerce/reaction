import { isEqual } from "lodash";
import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import xformCartGroupToCommonOrder from "/imports/plugins/core/cart/server/no-meteor/util/xformCartGroupToCommonOrder";

import getCartById from "../util/getCartById";

const inputSchema = new SimpleSchema({
  cartId: String,
  cartToken: {
    type: String,
    optional: true
  },
  fulfillmentGroupId: String
});

/**
 * @name getShipmentQuotesQueryStatus
 * @param  {Array} rates    Rate array
 * @return {Object} An object with `shipmentQuotes` and `shipmentQuotesQueryStatus` on it
 * @private
 */
function getShipmentQuotesQueryStatus(rates) {
  if (rates.length === 0) {
    return {
      shipmentQuotes: [],
      shipmentQuotesQueryStatus: {
        requestStatus: "pending"
      }
    };
  }

  const firstRateItem = rates[0];
  if (firstRateItem.requestStatus === "error") {
    return {
      shipmentQuotes: [],
      shipmentQuotesQueryStatus: {
        requestStatus: firstRateItem.requestStatus,
        shippingProvider: firstRateItem.shippingProvider,
        message: firstRateItem.message
      }
    };
  }

  return {
    shipmentQuotes: rates,
    shipmentQuotesQueryStatus: {
      requestStatus: "success",
      numOfShippingMethodsFound: rates.length
    }
  };
}

/**
 * @method updateFulfillmentOptionsForGroup
 * @summary Updates the fulfillment quotes for a fulfillment group
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} input.cartId - The ID of the cart to update fulfillment options for
 * @param {String} [input.cartToken] - The token for the cart, required if it is an anonymous cart
 * @param {String} input.fulfillmentGroupId - The group to update fulfillment options for
 * @return {Promise<Object>} An object with a `cart` property containing the updated cart
 */
export default async function updateFulfillmentOptionsForGroup(context, input) {
  const cleanedInput = inputSchema.clean(input || {});
  inputSchema.validate(cleanedInput);

  const { cartId, cartToken, fulfillmentGroupId } = cleanedInput;
  const { appEvents, collections } = context;
  const { Cart } = collections;

  const cart = await getCartById(context, cartId, { cartToken, throwIfNotFound: true });

  const fulfillmentGroup = (cart.shipping || []).find((group) => group._id === fulfillmentGroupId);
  if (!fulfillmentGroup) throw new ReactionError("not-found", `Fulfillment group with ID ${fulfillmentGroupId} not found in cart with ID ${cartId}`);

  const commonOrder = await xformCartGroupToCommonOrder(cart, fulfillmentGroup, context);

  // Map the items onto the fulfillment groups
  fulfillmentGroup.items = fulfillmentGroup.itemIds.map((itemId) => cart.items.find((item) => item._id === itemId));

  // TODO: In the future, we should update this with discounts
  const groupDiscountTotal = 0;
  const groupItemTotal = fulfillmentGroup.items.reduce((sum, item) => (sum + item.subtotal.amount), 0);

  const totals = {
    groupDiscountTotal: {
      amount: groupDiscountTotal,
      currencyCode: cart.currencyCode
    },
    groupItemTotal: {
      amount: groupItemTotal,
      currencyCode: cart.currencyCode
    },
    groupTotal: {
      amount: groupItemTotal - groupDiscountTotal,
      currencyCode: cart.currencyCode
    }
  };

  // In the future we want to do this async and subscribe to the results
  const rates = await context.queries.getFulfillmentMethodsWithQuotes(commonOrder, totals, context);

  const { shipmentQuotes, shipmentQuotesQueryStatus } = getShipmentQuotesQueryStatus(rates);

  if (!isEqual(shipmentQuotes, fulfillmentGroup.shipmentQuotes) || !isEqual(shipmentQuotesQueryStatus, fulfillmentGroup.shipmentQuotesQueryStatus)) {
    const { matchedCount } = await Cart.updateOne({
      "_id": cartId,
      "shipping._id": fulfillmentGroupId
    }, {
      $set: {
        "shipping.$.shipmentQuotes": shipmentQuotes,
        "shipping.$.shipmentQuotesQueryStatus": shipmentQuotesQueryStatus
      }
    });
    if (matchedCount !== 1) throw new ReactionError("server-error", "Unable to update cart");

    const updatedCart = await Cart.findOne({ _id: cartId });
    await appEvents.emit("afterCartUpdate", updatedCart);

    return { cart: updatedCart };
  }

  return { cart };
}
