import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Copy items from an anonymous cart into a new account cart, and then delete the
 *   anonymous cart.
 * @param {Object} context App context
 * @param {Object} anonymousCart The anonymous cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @returns {Object} The new account cart
 */
export default async function convertAnonymousCartToNewAccountCart(context, {
  anonymousCart,
  anonymousCartSelector
}) {
  const { accountId, collections: { Cart } } = context;

  const createdAt = new Date();
  const currencyCode = anonymousCart.currencyCode || "USD";
  const { _id, referenceId, shopId } = anonymousCart;

  const newCart = {
    _id: Random.id(),
    accountId,
    anonymousAccessToken: null,
    currencyCode,
    createdAt,
    items: anonymousCart.items,
    shopId,
    updatedAt: createdAt,
    workflow: {
      status: "new"
    }
  };

  if (referenceId) {
    // referenceId has a uniqueness constraint but we want to copy the same value from anonymous cart to account cart
    // so we have to remove the referenceId from the anonymous cart first
    await Cart.updateOne({ _id }, { $unset: { referenceId: 1 } });
    newCart.referenceId = referenceId;
  }

  const savedCart = await context.mutations.saveCart(context, newCart);

  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) {
    if (referenceId) {
      await Cart.updateOne({ _id }, { $set: { referenceId } });
    }
    throw new ReactionError("server-error", "Unable to delete anonymous cart");
  }

  return savedCart;
}
