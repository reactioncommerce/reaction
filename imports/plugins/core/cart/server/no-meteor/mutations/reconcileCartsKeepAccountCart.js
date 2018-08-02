import { Meteor } from "meteor/meteor";

/**
 * @summary Delete anon cart and return accountCart
 * @param {Object} accountCart The account cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {MongoDB.Collection} Cart The Cart collection
 * @return {Object} The account cart
 */
export default async function reconcileCartsKeepAccountCart({ accountCart, anonymousCartSelector, Cart }) {
  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new Meteor.Error("server-error", "Unable to delete anonymous cart");
  return accountCart;
}
