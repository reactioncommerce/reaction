import i18n from "./i18n/index.js";
import policies from "./policies.json";
import preStartup from "./preStartup.js";
import mutations from "./mutations/index.js";
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
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Pricing",
    name: "reaction-pricing",
    version: app.context.appVersion,
    i18n,
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
    mutations,
    policies,
    queries,
    catalog: {
      publishedProductFields: ["price"],
      publishedProductVariantFields: ["compareAtPrice", "price"]
    },
    simpleSchemas: {
      PriceRange
    }
  });
}
