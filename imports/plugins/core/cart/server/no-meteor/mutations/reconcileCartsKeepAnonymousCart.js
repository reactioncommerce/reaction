import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Update account cart to have only the anonymous cart items, delete anonymous
 *   cart, and return updated accountCart.
 * @todo When we add a "save for later" / "wish list" feature, we may want to update this
 *   to move existing account cart items to there.
 * @param {Object} accountCart The account cart document
 * @param {Object} anonymousCart The anonymous cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {Object} context App context
 * @returns {Object} The updated account cart
 */
export default async function reconcileCartsKeepAnonymousCart({
  accountCart,
  anonymousCart,
  anonymousCartSelector,
  context
}) {
  const { collections } = context;
  const { Cart } = collections;

  const updatedCart = {
    ...accountCart,
    items: anonymousCart.items,
    updatedAt: new Date()
  };

  const savedCart = await context.mutations.saveCart(context, updatedCart);

  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new ReactionError("server-error", "Unable to delete anonymous cart");

  return savedCart;
}
