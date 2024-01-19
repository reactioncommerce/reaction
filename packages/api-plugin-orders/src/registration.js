import SimpleSchema from "simpl-schema";

const validatorSchema = new SimpleSchema({
  name: String,
  fn: Function
});

// Objects with `name` and `fn` properties
export const customOrderValidators = [];

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandlerForOrder({ name, order }) {
  if (order) {
    const { customValidators } = order;

    if (!Array.isArray(customValidators)) throw new Error(`In ${name} plugin registerPlugin object, order.customValidators must be an array`);
    validatorSchema.validate(customValidators);

    customOrderValidators.push(...customValidators);
  }
}
