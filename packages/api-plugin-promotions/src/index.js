import { createRequire } from "module";
import { promotions, registerPluginHandlerForPromotions } from "./registration.js";
import startup from "./startup.js";
import preStartupPromotions from "./preStartup.js";
import registerPromotionsHandlers from "./handlers/registerPromotionsHandlers.js";
import { Promotion } from "./simpleSchemas.js";
import operators from "./operators/index.js";

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
      Promotions: {
        name: "Promotions",
      },
    },
    simpleSchemas: {
      Promotion,
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForPromotions],
      preStartup: [preStartupPromotions],
      startup: [startup, registerPromotionsHandlers],
    },
    contextAdditions: {
      promotions: {
        ...promotions,
        registerProcessor: (processorName, func) => {
          app.context.promotion.processors[processorName] = func;
        },
        registerAction: (actionName, func) => {
          app.context.promotion.action[actionName] = func;
        }
      },
      promotionProcessors: {},
      promotionActions: {}
    },
    promotions: {
      operators,
    },
  });
}
