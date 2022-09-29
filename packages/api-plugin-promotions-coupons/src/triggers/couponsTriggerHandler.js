import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import { Engine } from "json-rules-engine";
import { CouponTriggerParameters } from "../simpleSchemas.js";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "couponsTriggerHandler.js"
};

/**
 * @summary a no-op function for testing of promotions
 * @param {Object} context - The application context
 * @param {Object} enhancedCart - The cart to apply promotions to
 * @param {Object} trigger - The parameters to pass to the trigger
 * @returns {Boolean} - Whether the promotion can be applied to the cart
 */
export async function couponTriggerHandler(context, enhancedCart, { triggerParameters }) {
  const {
    promotions: { operators }
  } = context;

  const engine = new Engine();
  Object.keys(operators).forEach((operatorKey) => {
    engine.addOperator(operatorKey, operators[operatorKey]);
  });
  engine.addRule(triggerParameters);
  const facts = { cart: enhancedCart };

  // eslint-disable-next-line no-await-in-loop
  const results = await engine.run(facts);
  const { failureResults } = results;
  Logger.debug({ ...logCtx, ...results }, "Coupon trigger handler called");
  return failureResults.length === 0;
}

export default {
  key: "coupons",
  handler: couponTriggerHandler,
  paramSchema: CouponTriggerParameters
};
