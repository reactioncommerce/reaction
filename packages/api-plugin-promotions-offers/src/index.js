import { createRequire } from "module";
import triggers from "./triggers/index.js";
import enhancers from "./enhancers/index.js";
import facts from "./facts/index.js";
import { promotionOfferFacts, registerPromotionOfferFacts } from "./registration.js";
import { ConditionRule } from "./simpleSchemas.js";
import preStartupPromotionOffer from "./preStartup.js";

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
    functionsByType: {
      preStartup: [preStartupPromotionOffer],
      registerPluginHandler: [registerPromotionOfferFacts]
    },
    contextAdditions: {
      promotionOfferFacts
    },
    promotions: {
      triggers,
      enhancers
    },
    promotionOfferFacts: facts,
    simpleSchemas: {
      ConditionRule
    }
  });
}
