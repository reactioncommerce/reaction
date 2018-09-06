import ReactionError from "@reactioncommerce/reaction-error";
import { Cart as CartSchema } from "/imports/collections/schemas";
import appEvents from "/imports/plugins/core/core/server/appEvents";

/**
 * @summary Update account cart to have only the anonymous cart items, delete anonymous
 *   cart, and return updated accountCart.
 * @todo When we add a "save for later" / "wish list" feature, we may want to update this
 *   to move existing account cart items to there.
 * @param {Object} accountCart The account cart document
 * @param {Object} accountCartSelector The MongoDB selector for the account cart
 * @param {Object} anonymousCart The anonymous cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {MongoDB.Collection} Cart The Cart collection
 * @return {Object} The updated account cart
 */
export default async function reconcileCartsKeepAnonymousCart({
  accountCart,
  accountCartSelector,
  anonymousCart,
  anonymousCartSelector,
  Cart
}) {
  const updatedAt = new Date();

  const modifier = {
    $set: {
      items: anonymousCart.items,
      updatedAt
    }
  };
  CartSchema.validate(modifier, { modifier: true });

  const { modifiedCount } = await Cart.updateOne(accountCartSelector, modifier);
  if (modifiedCount === 0) throw new ReactionError("server-error", "Unable to update cart");

  const updatedCart = {
    ...accountCart,
    items: anonymousCart.items,
    updatedAt
  };

  await appEvents.emit("afterCartUpdate", updatedCart._id, updatedCart);

  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new ReactionError("server-error", "Unable to delete anonymous cart");

  return updatedCart;
}
