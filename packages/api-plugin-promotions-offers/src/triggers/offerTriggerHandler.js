import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import { Engine } from "json-rules-engine";
import { OfferTriggerParameters } from "../simpleSchemas.js";

const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "offerTriggerHandler.js"
};

/**
 * @summary apply all offers to the cart
 * @param {String} context - The application context
 * @param {Object} enhancedCart - The cart to apply offers to
 * @param {Object} params - The parameters to pass to the trigger
 * @param {Object} params.promotion - The promotion to apply
 * @param {Object} params.triggerParameters - The parameters to pass to the trigger
 * @returns {Promise<boolean>} - The answer with offers applied
 */
export async function offerTriggerHandler(context, enhancedCart, { triggerParameters }) {
  const { promotions: { operators } } = context;

  const engine = new Engine();
  Object.keys(operators).forEach((operatorKey) => {
    engine.addOperator(operatorKey, operators[operatorKey]);
  });
  engine.addRule({
    ...triggerParameters,
    event: {
      type: "rulesCheckPassed"
    }
  });
  const facts = { cart: enhancedCart };

  const results = await engine.run(facts);
  const { failureResults } = results;
  Logger.debug({ ...logCtx, ...results });
  return failureResults.length === 0;
}

export default {
  key: "offers",
  handler: offerTriggerHandler,
  paramSchema: OfferTriggerParameters,
  type: "implicit"
};
