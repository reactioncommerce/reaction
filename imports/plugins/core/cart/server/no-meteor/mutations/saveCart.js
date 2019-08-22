import ReactionError from "@reactioncommerce/reaction-error";
import { Cart as CartSchema } from "/imports/collections/schemas";

/**
 * @summary Takes a new or updated cart, runs it through all registered transformations,
 *   validates, and upserts to database.
 * @param {Object} context - App context
 * @param {Object} cart - The cart to insert or replace
 * @param {Object} options - Options
 * @returns {Object} Transformed and saved cart
 */
export default async function saveCart(context, cart) {
  const { appEvents, collections: { Cart }, userId = null } = context;

  CartSchema.validate(cart);

  const { result, upsertedCount } = await Cart.replaceOne({ _id: cart._id }, cart, { upsert: true });
  if (result.ok !== 1) throw new ReactionError("server-error", "Unable to save cart");

  if (upsertedCount === 1) {
    await appEvents.emit("afterCartCreate", {
      cart,
      createdBy: userId
    });
  } else {
    await appEvents.emit("afterCartUpdate", {
      cart,
      updatedBy: userId
    });
  }

  return cart;
}
