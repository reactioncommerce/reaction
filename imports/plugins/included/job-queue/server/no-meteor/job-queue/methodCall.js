const methodsByRoot = {};

/**
 *
 */
export function registerMethod(root, method, fn) {
  if (!methodsByRoot[root]) methodsByRoot[root] = {};
  methodsByRoot[root][method] = fn;
}

/**
 *
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
