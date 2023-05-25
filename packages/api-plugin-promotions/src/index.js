import pkg from "../package.json" assert { type: "json" };
import { promotions, registerPluginHandlerForPromotions } from "./registration.js";
import mutations from "./mutations/index.js";
import preStartupPromotions from "./preStartup.js";
import { Promotion, CartPromotionItem, Stackability as PromotionStackability } from "./simpleSchemas.js";
import actions from "./actions/index.js";
import promotionTypes from "./promotionTypes/index.js";
import schemas from "./schemas/index.js";
import queries from "./queries/index.js";
import qualifiers from "./qualifiers/index.js";
import stackabilities from "./stackabilities/index.js";
import resolvers from "./resolvers/index.js";
import utils from "./utils/index.js";
import applyPromotions from "./handlers/applyPromotions.js";
import startupPromotions from "./startup.js";
import registerOffersHandlers from "./handlers/registerHandlers.js";


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
      CartPromotionItem,
      PromotionStackability
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
      promotionTypes,
      utils
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
