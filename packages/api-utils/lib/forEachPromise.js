/**
 * From https://stackoverflow.com/a/41791149/1669674
 *
 * @param {Any[]} items An array of items to pass one by one to `fn`.
 * @param {Function} fn A function that accepts an item from the array and returns a promise.
 * @returns {Promise} Promise that resolves with the value returned by the last function call
 */
export default function forEachPromise(items, fn) {
  return items.reduce(
    (promise, item) => promise
      .then(() => fn(item))
      .catch((error) => { throw error; }),
    Promise.resolve()
  );
}
