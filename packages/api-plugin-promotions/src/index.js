import { createRequire } from "module";
import { promotions, registerPluginHandlerForPromotions } from "./registration.js";
import mutations from "./mutations/index.js";
import preStartupPromotions from "./preStartup.js";
import { Promotion, CartPromotionItem } from "./simpleSchemas.js";
import actions from "./actions/index.js";
import promotionTypes from "./promotionTypes/index.js";
import schemas from "./schemas/index.js";
import queries from "./queries/index.js";
import qualifiers from "./qualifiers/index.js";
import stackabilities from "./stackabilities/index.js";
import resolvers from "./resolvers/index.js";
import applyPromotions from "./handlers/applyPromotions.js";
import startupPromotions from "./startup.js";
import registerOffersHandlers from "./handlers/registerHandlers.js";

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
    graphQL: {
      schemas,
      resolvers
    },
    collections: {
      Promotions: {
        name: "Promotions",
        indexes: [
          [{ shopId: 1, triggerType: 1, enabled: 1, state: 1, startDate: 1 }, { name: "shopId__triggerType__enabled__state__startDate" }],
          [{ shopId: 1, referenceId: 1 }, { unique: true }],
          [
            { "shopId": 1, "triggerType": 1, "enabled": 1, "triggers.triggerKey": 1, "triggers.triggerParameters.couponCode": 1, "startDate": 1 },
            { name: "shopId__triggerType__enabled__triggerKey__couponCode__startDate" }
          ]
        ]
      }
    },
    simpleSchemas: {
      Promotion,
      CartPromotionItem
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForPromotions],
      preStartup: [preStartupPromotions],
      startup: [startupPromotions, registerOffersHandlers]
    },
    contextAdditions: {
      promotions
    },
    cart: {
      transforms: [
        {
          name: "applyPromotionsToCart",
          fn: applyPromotions,
          priority: 99
        }
      ]
    },
    promotions: {
      actions,
      qualifiers,
      stackabilities,
      promotionTypes
    },
    sequenceConfigs: [
      {
        entity: "Promotions"
      }
    ],
    mutations,
    queries
  });
}
