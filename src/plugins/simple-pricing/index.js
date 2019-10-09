import preStartup from "./preStartup.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import getMinPriceSortByFieldPath from "./util/getMinPriceSortByFieldPath.js";
import mutateNewProductBeforeCreate from "./util/mutateNewProductBeforeCreate.js";
import mutateNewVariantBeforeCreate from "./util/mutateNewVariantBeforeCreate.js";
import publishProductToCatalog from "./util/publishProductToCatalog.js";
import { PriceRange } from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Pricing",
    name: "reaction-pricing",
    functionsByType: {
      getMinPriceSortByFieldPath: [getMinPriceSortByFieldPath],
      mutateNewProductBeforeCreate: [mutateNewProductBeforeCreate],
      mutateNewVariantBeforeCreate: [mutateNewVariantBeforeCreate],
      preStartup: [preStartup],
      publishProductToCatalog: [publishProductToCatalog],
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    queries,
    catalog: {
      publishedProductFields: ["price"],
      publishedProductVariantFields: ["price"]
    },
    simpleSchemas: {
      PriceRange
    }
  });
}
