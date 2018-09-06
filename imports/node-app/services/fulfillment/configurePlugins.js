import { getShippingPrices, graphqlResolvers, graphqlSchemas } from "./plugins/flat-rate";

/**
 * @summary Configure the Reaction app using plugins here
 * @param {Object} app Reaction service app
 * @returns {undefined}
 */
export default function configurePlugins(app) {
  /**
   * Plug in the Flat Rate Plugin
   */
  app.addGraphqlSchemas(graphqlSchemas);
  app.addGraphqlResolvers(graphqlResolvers);
  app.addShippingPricesFunction(getShippingPrices);
}
