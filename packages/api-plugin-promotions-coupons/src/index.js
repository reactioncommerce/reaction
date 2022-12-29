import { createRequire } from "module";
import schemas from "./schemas/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import triggers from "./triggers/index.js";
import { Coupon } from "./simpleSchemas.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: pkg.label,
    name: pkg.name,
    version: pkg.version,
    collections: {
      Coupons: {
        name: "Coupons",
        indexes: [
          [{ shopId: 1, code: 1 }],
          [{ shopId: 1, promotionId: 1 }]
        ]
      }
    },
    promotions: {
      triggers
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    simpleSchemas: {
      Coupon
    }
  });
}
