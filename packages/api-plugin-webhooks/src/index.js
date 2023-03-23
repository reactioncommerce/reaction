import { createRequire } from "module";
import startup from "./startup.js";
import { Webhook } from "./simpleSchemas.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";

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
      Webhooks: {
        name: "Webhooks",
        indexes: [
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ topic: 1, shopId: 1 }, { unique: true }]
        ]
      }
    },
    functionsByType: {
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    simpleSchemas: {
      Webhook
    }
  });
}
