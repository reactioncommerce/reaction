import { Action, Trigger } from "./simpleSchemas.js";
/**
 * @summary apply all schema extensions to the Promotions schema
 * @param {Object} context - The application context
 * @returns {undefined} undefined
 */
function extendSchemas(context) {
  const { promotions: { schemaExtensions }, simpleSchemas: { Promotions } } = context;
  schemaExtensions.forEach((extension) => {
    Promotions.extend(extension);
  });
}

/**
 * @summary Perform various scaffolding tasks on startup
 * @param {Object} context - The application context
 * @returns {Promise<void>} undefined
 */
export default async function startup(context) {
  extendSchemas(context);
  const { actions: additionalActions, triggers: additionalTriggers } = context.promotions;
  Action.extend({
    actionKey: {
      allowedValues: [...Action.getAllowedValuesForKey("actionKey"), ...additionalActions]
    }
  });

  Trigger.extend({
    triggerKey: {
      allowedValues: [...Trigger.getAllowedValuesForKey("triggerKey"), ...additionalTriggers]
    }
  });
}
