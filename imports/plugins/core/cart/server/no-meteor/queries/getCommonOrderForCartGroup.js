import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import xformCartGroupToCommonOrder from "../util/xformCartGroupToCommonOrder";

const inputSchema = new SimpleSchema({
  cartId: String,
  fulfillmentGroupId: String
});

/**
 * @name getCommonOrderForCartGroup
 * @method
 * @memberof Cart/NoMeteorQueries
 * @summary Query the Cart collection for a cart and fulfillment group
 *    with the provided cartId and fulfillmentGroupId, and return
 *    a CommonOrder style object
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - request parameters
 * @param {String} input.cartId - cart ID to create CommonOrder from
 * @param {String} input.fulfillmentGroupId - fulfillment group ID to create CommonOrder from
 * @returns {Promise<Object>|undefined} - A CommonOrder document
 */
export default async function getCommonOrderForCartGroup(context, input = {}) {
  inputSchema.validate(input);
  const { collections } = context;
  const { Cart } = collections;

  const {
    cartId,
    fulfillmentGroupId
  } = input;

  if (!cartId) {
    throw new ReactionError("invalid-param", "You must provide a cart ID");
  }

  if (!fulfillmentGroupId) {
    throw new ReactionError("invalid-param", "You must provide a fulfillment group ID");
  }

  const cart = await Cart.findOne({ _id: cartId });
  const group = cart.shipping.find((grp) => grp._id === fulfillmentGroupId);

  return xformCartGroupToCommonOrder(cart, group, context);
}
