import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import { Engine } from "json-rules-engine";

const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "applyOffersToCart.js"
};

/**
 * @summary apply all offers to the cart
 * @param {String} context - The application context
 * @param {Object} enhancedCart - The cart to apply offers to
 * @param {Object} promotion - The promotion to pass to the trigger
 * @param {Object} triggerParameters - The parameters to pass to the trigger
 * @returns {Promise<boolean>} - The answer with offers applied
 */
export default async function offerTriggerHandler(context, enhancedCart, promotion, triggerParameters) {
  const {
    promotions: { operators }
  } = context;

  const engine = new Engine();
  Object.keys(operators).forEach((operatorKey) => {
    engine.addOperator(operatorKey, operators[operatorKey]);
  });
  engine.addRule(promotion.offerRule);
  const facts = { cart: enhancedCart };

  // eslint-disable-next-line no-await-in-loop
  const results = await engine.run(facts);
  const { failureResults } = results;
  Logger.debug({ ...logCtx, ...results });
  return failureResults.length === 0;
}
