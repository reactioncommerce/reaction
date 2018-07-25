import Hooks from "@reactioncommerce/hooks";
import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import hashLoginToken from "/imports/plugins/core/accounts/server/no-meteor/util/hashLoginToken";

const inputSchema = new SimpleSchema({
  "cartId": String,
  "items": {
    type: Array,
    minCount: 1
  },
  "items.$": Object,
  "items.$.cartItemId": String,
  "items.$.quantity": {
    type: SimpleSchema.Integer,
    min: 0
  },
  "token": {
    type: String,
    optional: true
  }
});

/**
 * @method updateCartItemsQuantity
 * @summary Sets a new quantity for one or more items in a cart
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Necessary input
 * @param {String} input.cartId - The ID of the cart in which all of the items exist
 * @param {String} input.items - Array of items to update
 * @param {Number} input.items.cartItemId - The cart item ID
 * @param {Object} input.items.quantity - The new quantity, which must be an integer of 0 or greater
 * @param {String} input.token - The token if the cart is an anonymous cart
 * @return {Promise<Object>} An object containing the updated cart in a `cart` property
 */
export default async function updateCartItemsQuantity(context, input) {
  inputSchema.validate(input || {});

  const { accountId, collections } = context;
  const { Cart } = collections;
  const { cartId, items, token } = input;

  const selector = { _id: cartId };
  if (token) {
    selector.anonymousAccessToken = hashLoginToken(token);
  } else if (accountId) {
    selector.accountId = accountId;
  } else {
    throw new Meteor.Error("invalid-param", "A token is required when updating an anonymous cart");
  }

  const modifier = { $set: {} };
  const removeItemsModifier = { $pull: { items: { $or: [] } } };
  const arrayFilters = [];

  items.forEach((item, index) => {
    if (item.quantity === 0) {
      removeItemsModifier.$pull.items.$or.push({ _id: item.cartItemId });
    } else {
      modifier.$set[`items.$[elem${index}].quantity`] = item.quantity;
      arrayFilters.push({ [`elem${index}._id`]: item.cartItemId });
    }
  });

  if (Object.keys(modifier.$set).length > 0) {
    const { modifiedCount } = await Cart.updateOne(selector, modifier, { arrayFilters });
    if (modifiedCount === 0) throw new Meteor.Error("not-found", "Cart not found");
  }

  // If any items had zero quantity, we will now remove them in a separate Cart update.
  // We could not have added `$pull` to the previous update modifier because MongoDB
  // will not allow updates of `items` in two different operators in the same modifier.
  if (removeItemsModifier.$pull.items.$or.length > 0) {
    const { modifiedCount } = await Cart.updateOne(selector, removeItemsModifier);
    if (modifiedCount === 0) throw new Meteor.Error("not-found", "Cart not found");
  }

  const cart = await Cart.findOne(selector);
  if (!cart) throw new Meteor.Error("not-found", "Cart not found");

  Hooks.Events.run("afterCartUpdate", cart._id);
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

  return { cart };
}
