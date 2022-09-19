import { performance } from "perf_hooks";
import { createRequire } from "module";
import { Engine } from "json-rules-engine";
import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import enhancers from "../enhancers/index.js";

const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "applyOffersToCart.js"
};

const now = new Date();

/**
 * @summary A cart has qualified for a promotion, time to tell the world
 * @param {Object} context - The application context
 * @param {Object} promotion - The promotion that the cart qualified for
 * @param {Object} cart - The cart
 * @returns {undefined} undefined
 */
function fireOfferEvent(context, promotion, { cart }) {
  const { appEvents } = context;
  Logger.info({ logCtx, promotion }, "Qualified for promotion");
  appEvents.emit("qualifiedForPromotion", { cart, promotion });
}

/**
 * @summary enhance the cart with calculated totals
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to enhance
 * @returns {Object} - The enhanced cart
 */
function enhanceCart(context, cart) {
  const cartForEvaluation = _.cloneDeep(cart);
  enhancers.forEach((enhancer) => {
    enhancer(context, cartForEvaluation);
  });
  return cartForEvaluation;
}

/**
 * @summary fetch all valid promotions
 * @param {Object} context - application context
 * @returns {Promise<Array>} - An array of applicable Promotions
 */
async function getOfferPromotions(context) {
  const { collections: { Promotions } } = context;
  const offerPromotions = await Promotions.find({
    "triggers.triggerKey": "offers",
    "enabled": true,
    "startDate": { $gt: now },
    "endDate": { $lt: now }
  }).toArray();
  Logger.debug({ ...logCtx, applicableOffers: offerPromotions.length }, "Fetched applicable offers");
  return offerPromotions;
}

/**
 * @summary review offer rules and apply discounts
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to apply offers to
 * @returns {Promise<Object>} - The results of the rules analysis
 */
export default async function applyOffersToCart(context, cart) {
  const startTime = performance.now();
  const enhancedCart = enhanceCart(context, cart);
  const { promotions: { operators }, appEvents } = context;
  const offerPromotions = await getOfferPromotions(context);
  const allResults = [];
  const qualifiedPromotions = [];
  for (const promotion of offerPromotions) {
    const engine = new Engine();
    Object.keys(operators).forEach((operatorKey) => {
      engine.addOperator(operatorKey, operators[operatorKey]);
    });
    engine.addRule(promotion.offerRule);
    const facts = { cart: enhancedCart };

    // eslint-disable-next-line no-unused-vars
    engine.on("success", (event, almanac, ruleResult) => {
      fireOfferEvent(context, promotion, { cart });
      qualifiedPromotions.push(promotion);
    });

    // eslint-disable-next-line no-await-in-loop
    const results = await engine.run(facts);
    allResults.push(results);
  }
  const endTime = performance.now();
  const perfTime = endTime - startTime;
  appEvents.emit("cartPromotionAnalysisComplete", { cart, qualifiedPromotions });
  Logger.info({ perfTime, ...logCtx, qualifiedPromotions }, "Completed analyzing cart for Offers");
  Logger.debug({ ...logCtx, ...allResults });
  return allResults;
}
