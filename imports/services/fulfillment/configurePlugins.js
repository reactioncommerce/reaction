import { getShippingPrices } from "./plugins/flat-rate";

/**
 * @summary Configure the Reaction app using plugins here
 * @param {Object} app Reaction service app
 * @returns {undefined}
 */
export default function configurePlugins(app) {
  // app.graphqlSchemas.push(pluginSchema)

  /**
   * Add shipping price functions from plugins here
   */
  app.addShippingPricesFunction(getShippingPrices);
}
