import SimpleSchema from "simpl-schema";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  "cartId": String,
  "cartToken": String,
  "fulfillmentType": String,
  "itemIds": {
    type: Array
  },
  "itemIds.$": String
});

/**
 * @method setFulfillmentTypeForItems
 * @summary Assigns the selected fulfillment group to the items provided
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} input.cartId - An anonymous cart ID
 * @param {String} input.cartToken - The cartToken for accessing the anonymous cart
 * @param {String} input.fulfillmentType - The Fulfillment type to be set for the provided items
 * @param {String[]} input.items - The array of items to be requested to be assigned to the selected fulfillment type
 * @returns {Promise<Object>} An object with `cart` property containing the updated cart
 */
export default async function setFulfillmentTypeForItems(context, input) {
  inputSchema.validate(input || {});

  const { collections: { Cart } } = context;
  const { cartId, cartToken, fulfillmentType, itemIds: itemsInput } = input;

  const cart = await Cart.findOne({
    _id: cartId,
    anonymousAccessToken: hashToken(cartToken)
  });

  if (!cart) throw new ReactionError("not-found", "Cart not found");

  if (!fulfillmentType || fulfillmentType === "undecided") throw new ReactionError("invalid-param", "Invalid Fulfillment Type received");

  if (!itemsInput || itemsInput.length === 0) throw new ReactionError("invalid-param", "Item Ids not provided");

  cart.items = (cart.items || []).map((item) => {
    if (itemsInput.includes(item._id)) {
      item.selectedFulfillmentType = fulfillmentType;
    }
    return item;
  });

  const savedCart = await context.mutations.saveCart(context, cart);

  return { cart: savedCart };
}
