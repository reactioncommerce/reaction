import pkg from "../package.json";
import calculateOrderTaxes from "./util/calculateOrderTaxes.js";
import getTaxCodes from "./util/getTaxCodes.js";
import { TaxRates } from "./simpleSchemas.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Flat Rate Taxes",
    name: "taxes-flat-rate",
    version: pkg.version,
    collections: {
      Taxes: {
        name: "Taxes",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ country: 1 }, { name: "c2_country" }],
          [{ postal: 1 }, { name: "c2_postal" }],
          [{ region: 1 }, { name: "c2_region" }],
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ taxCode: 1 }, { name: "c2_taxCode" }]
        ]
      },
      TaxCodes: {
        name: "TaxCodes"
      }
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    simpleSchemas: {
      TaxRates
    },
    taxServices: [
      {
        displayName: "Custom Rates",
        name: "custom-rates",
        functions: {
          calculateOrderTaxes,
          getTaxCodes
        }
      }
    ]
  });
}
