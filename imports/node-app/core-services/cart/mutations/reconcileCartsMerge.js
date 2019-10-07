import ReactionError from "@reactioncommerce/reaction-error";
import addCartItems from "../util/addCartItems.js";

/**
 * @summary Update account cart to have only the anonymous cart items, delete anonymous
 *   cart, and return updated accountCart.
 * @param {Object} accountCart The account cart document
 * @param {Object} anonymousCart The anonymous cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {Object} context App context
 * @returns {Object} The updated account cart
 */
export default async function reconcileCartsMerge({
  accountCart,
  anonymousCart,
  anonymousCartSelector,
  context
}) {
  const { collections } = context;
  const { Cart } = collections;

  // Convert item schema to input item schema
  const itemsInput = (anonymousCart.items || []).map((item) => ({
    metafields: item.metafields,
    price: item.price,
    productConfiguration: {
      productId: item.productId,
      productVariantId: item.variantId
    },
    quantity: item.quantity
  }));

  // Merge the item lists
  const { updatedItemList: items } = await addCartItems(context, accountCart.items, itemsInput, {
    skipPriceCheck: true
  });

  const updatedCart = {
    ...accountCart,
    items,
    updatedAt: new Date()
  };

  const savedCart = await context.mutations.saveCart(context, updatedCart);

  // Delete anonymous cart
  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new ReactionError("server-error", "Unable to delete anonymous cart");

  return savedCart;
}
