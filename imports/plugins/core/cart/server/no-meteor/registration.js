import SimpleSchema from "simpl-schema";

const transformSchema = new SimpleSchema({
  name: String,
  fn: Function,
  priority: Number
});

// Objects with `name`, `priority` and `fn` properties
export const cartTransforms = [];

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ name, cart }) {
  if (cart) {
    const { transforms } = cart;

    if (!Array.isArray(transforms)) throw new Error(`In ${name} plugin registerPlugin object, cart.transforms must be an array`);
    transformSchema.validate(transforms);

    cartTransforms.push(...transforms);
    cartTransforms.sort((prev, next) => prev.priority - next.priority);
  }
}
