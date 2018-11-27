import ReactionError from "@reactioncommerce/reaction-error";
import { Cart as CartSchema } from "/imports/collections/schemas";
import appEvents from "/imports/node-app/core/util/appEvents";
import addCartItems from "../util/addCartItems";

/**
 * @summary Update account cart to have only the anonymous cart items, delete anonymous
 *   cart, and return updated accountCart.
 * @param {Object} accountCart The account cart document
 * @param {Object} accountCartSelector The MongoDB selector for the account cart
 * @param {Object} anonymousCart The anonymous cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {Object} collections A map of MongoDB collection instances
 * @return {Object} The updated account cart
 */
export default async function reconcileCartsMerge({
  accountCart,
  accountCartSelector,
  anonymousCart,
  anonymousCartSelector,
  collections
}) {
  const { Cart } = collections;

  // Convert item schema to input item schema
  const itemsInput = (anonymousCart.items || []).map((item) => ({
    metafields: item.metafields,
    price: {
      currencyCode: item.priceWhenAdded.currencyCode
    },
    productConfiguration: {
      productId: item.productId,
      productVariantId: item.variantId
    },
    quantity: item.quantity
  }));

  // Merge the item lists
  const { updatedItemList: items } = await addCartItems(collections, accountCart.items, itemsInput, {
    skipPriceCheck: true
  });

  // Update account cart
  const updatedAt = new Date();

  const modifier = {
    $set: {
      items,
      updatedAt
    }
  };
  CartSchema.validate(modifier, { modifier: true });

  const { modifiedCount } = await Cart.updateOne(accountCartSelector, modifier);
  if (modifiedCount === 0) throw new ReactionError("server-error", "Unable to update cart");

  const updatedCart = {
    ...accountCart,
    items,
    updatedAt
  };

  await appEvents.emit("afterCartUpdate", updatedCart);

  // Delete anonymous cart
  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new ReactionError("server-error", "Unable to delete anonymous cart");

  return updatedCart;
}
