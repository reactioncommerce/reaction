import store from "store";
import { ReactiveVar } from "meteor/reactive-var";

const storageKey = "Reaction.anonymousCarts";

const anonymousCartsStored = store.get(storageKey) || [];
const anonymousCartsReactive = new ReactiveVar(anonymousCartsStored);

/**
 * @summary Gets a reactive array of anonymous carts saved locally
 * @returns {Object[]} Cart objects with _id and token
 * @export
 */
export function getAnonymousCartsReactive() {
  return anonymousCartsReactive.get();
}

/**
 * @summary Sets an array of anonymous carts saved locally
 * @param {Object[]} carts objects with _id and token
 * @returns {undefined}
 * @export
 */
export function setAnonymousCarts(carts) {
  store.set(storageKey, carts);
  anonymousCartsReactive.set(carts);
}

/**
 * @summary Saves a single anonymous cart locally
 * @param {Object} cart Object with _id and token
 * @returns {undefined}
 * @export
 */
export function storeAnonymousCart(cart) {
  const carts = store.get(storageKey) || [];
  carts.push(cart);
  setAnonymousCarts(carts);
}

/**
 * @summary Removes a single anonymous cart from local save list
 * @param {String} cartId The cart ID
 * @returns {undefined}
 * @export
 */
export function unstoreAnonymousCart(cartId) {
  let carts = store.get(storageKey) || [];
  carts = carts.filter((cart) => cart._id !== cartId);
  setAnonymousCarts(carts);
}
