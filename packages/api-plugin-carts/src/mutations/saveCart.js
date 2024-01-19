import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Takes a new or updated cart, runs it through all registered transformations,
 *   validates, and upserts to database.
 * @param {Object} context - App context
 * @param {Object} cart - The cart to transform and insert or replace
 * @param {String} emittedBy - Who emitted the event
 * @returns {Object} Transformed and saved cart
 */
export default async function saveCart(context, cart, emittedBy) {
  const { appEvents, collections: { Cart }, userId = null } = context;
  // These will mutate `cart`
  await context.mutations.removeMissingItemsFromCart(context, cart);
  await context.mutations.transformAndValidateCart(context, cart);

  const { result, upsertedCount } = await Cart.replaceOne({ _id: cart._id }, cart, { upsert: true });
  if (result.ok !== 1) throw new ReactionError("server-error", "Unable to save cart");

  if (upsertedCount === 1) {
    appEvents.emit("afterCartCreate", {
      cart,
      createdBy: userId,
      emittedBy
    });
  } else {
    appEvents.emit("afterCartUpdate", {
      cart,
      updatedBy: userId,
      emittedBy
    });
  }

  return cart;
}
