// Objects with `name`, `priority` and `fn` properties
export const cartTransforms = [];

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ cart }) {
  if (cart) {
    const { transforms } = cart;
    if (Array.isArray(transforms)) {
      cartTransforms.push(...transforms);
      cartTransforms.sort((prev, next) => prev.priority - next.priority);
    }
  }
}
