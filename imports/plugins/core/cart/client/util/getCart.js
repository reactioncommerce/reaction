import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { Accounts, Cart } from "/lib/collections";
import { getAnonymousCartsReactive } from "./anonymousCarts";

/**
 * @summary Gets the current cart.
 * @returns {Object|null} The cart document or null
 */
export default function getCart() {
  const userId = Meteor.userId();
  const account = (userId && Accounts.findOne({ userId })) || null;

  const shopId = Reaction.getCartShopId();

  // If there is an anonymous cart for the shop ID, prefer that.
  // Otherwise, the account cart.
  const storedCarts = getAnonymousCartsReactive();
  if (storedCarts && storedCarts.length) {
    const storedCartForShop = storedCarts.find((storedCart) => storedCart.shopId === shopId);
    if (storedCartForShop) {
      const anonymousCart = Cart.findOne({
        _id: storedCartForShop._id
      });

      return { cart: anonymousCart || null, token: storedCartForShop.token };
    }
  }

  if (account) {
    const accountCart = Cart.findOne({
      accountId: account._id,
      shopId
    });

    return { cart: accountCart || null, token: null };
  }

  return { cart: null, token: null };
}
