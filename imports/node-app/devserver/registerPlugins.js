import registerSimpleInventoryPlugin from "/imports/plugins/included/simple-inventory/server/no-meteor/register";
import registerSimplePricingPlugin from "/imports/plugins/included/simple-pricing/server/no-meteor/register";

/**
 * @summary A function in which you should call `register` function for each API plugin,
 *   in the order in which you want to register them.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {Promise<null>} Null
 */
export default async function registerPlugins(app) {
  await registerSimpleInventoryPlugin(app);
  await registerSimplePricingPlugin(app);
}
