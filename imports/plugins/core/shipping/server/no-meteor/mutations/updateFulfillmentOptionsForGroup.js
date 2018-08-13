import { isEqual } from "lodash";
import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import getCartById from "../../../../cart/server/no-meteor/util/getCartById";
import getShippingRates from "../util/getShippingRates";

const inputSchema = new SimpleSchema({
  cartId: String,
  cartToken: {
    type: String,
    optional: true
  },
  fulfillmentGroupId: String
});

/**
 * @name getFulfillmentUpdateModifier
 * @param  {Array} rates    Rate array
 * @return {Object|null} A MongoDB modifier or null if no update should happen
 * @private
 */
function getFulfillmentUpdateModifier(rates) {
  let update = null;

  if (rates.length === 1 && rates[0].requestStatus === "error") {
    const errorDetails = rates[0];
    update = {
      $set: {
        "shipping.$.shipmentQuotes": [],
        "shipping.$.shipmentQuotesQueryStatus": {
          requestStatus: errorDetails.requestStatus,
          shippingProvider: errorDetails.shippingProvider,
          message: errorDetails.message
        }
      }
    };
  }

  if (rates.length > 0 && rates[0].requestStatus === undefined) {
    update = {
      $set: {
        "shipping.$.shipmentQuotes": rates,
        "shipping.$.shipmentQuotesQueryStatus": {
          requestStatus: "success",
          numOfShippingMethodsFound: rates.length
        }
      }
    };
  }

  return update;
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

  // In the future we want to do this async and subscribe to the results
  const rates = await getShippingRates(cart, context);

  let modifier = getFulfillmentUpdateModifier(rates);
  if (!modifier) {
    modifier = {
      $set: {
        "shipping.$.shipmentQuotesQueryStatus": {
          requestStatus: "pending"
        }
      }
    };
  }

  const { modifiedCount } = await Cart.updateOne({
    "_id": cartId,
    "shipping._id": fulfillmentGroupId
  }, modifier);
  if (modifiedCount !== 1) throw new ReactionError("server-error", "Unable to update cart");

  const updatedCart = await Cart.findOne({ _id: cartId });
  await appEvents.emit("afterCartUpdate", cartId, updatedCart);

  return { cart: updatedCart };
}
