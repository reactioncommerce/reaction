import enhancers from "./enhancers/index.js";
import handlers from "./handlers/index.js";
import noop from "./actions/noop";

/**
 * @summary handle cart events
 * @param {Object} context - The per request application context
 * @returns {void}
 */
export default function startupOffers(context) {
  const { promotionContext } = context;

  promotionContext.registerEnhancer(enhancers);
  promotionContext.registerTrigger("offers", handlers.offerTriggerHandler);
  promotionContext.registerAction("no-op", noop);
}
