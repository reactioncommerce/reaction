import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import { extendFulfillmentSchemas } from "./simpleSchemas.js";

const logCtx = { name: "fulfillment", file: "preStartup" };

/**
 * @summary Called before startup to extend schemas
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function fulfillmentPreStartup(context) {
  const allFulfillmentTypesArray = context.allRegisteredFulfillmentTypes?.registeredFulfillmentTypes;

  if (!allFulfillmentTypesArray || allFulfillmentTypesArray.length === 0) {
    Logger.warn(logCtx, "No fulfillment types available");
    throw new ReactionError("not-configured", "No fulfillment types available");
  }

  extendFulfillmentSchemas(context.simpleSchemas, allFulfillmentTypesArray);
}
