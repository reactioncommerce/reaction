const methodsByRoot = {};

/**
 * @summary Registers a method. This isn't an elegant way to do this,
 *   but it simulates the Meteor.methods that were used in the previous
 *   version of this package, did not require a larger rewrite, and works fine.
 * @param {String} root Name of collection
 * @param {String} method Name of method
 * @param {Function} fn Function to run when this method is called
 * @return {undefined}
 */
export function registerMethod(root, method, fn) {
  if (!methodsByRoot[root]) methodsByRoot[root] = {};
  methodsByRoot[root][method] = fn;
}

/**
 * @summary Call a method that was registered with registerMethod
 * @param {String} root Name of collection
 * @param {String} method Name of method
 * @param {Array} params Parameter array to pass as method arguments
 * @param {Function} cb Callback
 * @param {Function} after After hook, which may transform the method
 *   result before it is passed to `cb`
 * @return {undefined}
 */
export default async function methodCall(root, method, params, cb, after = (ret) => ret) {
  const ns = root.root || root;
  const nsMethods = methodsByRoot[ns];

  if (!nsMethods) throw new Error(`Invalid root: ${ns}`);

  const fn = nsMethods[method];
  if (typeof fn !== "function") {
    throw new Error("Job remote method call error, no valid invocation method found.");
  }

  let result;
  try {
    result = await fn(...params);
  } catch (error) {
    if (typeof cb === "function") {
      return cb(error);
    }
    throw error;
  }

  const afterResult = await after(result);

  if (typeof cb === "function") {
    return cb(null, afterResult);
  }

  return afterResult;
}
