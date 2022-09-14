
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
  const { simpleSchemas: { Promotions } } = context;
  Promotions.extend({
    "actions.$.actionKey": {
      allowedValues: Promotions.getDefinition(
        "actions.$.actionKey",
        ["allowedValues"]
      ).type[0].allowedValues.concat(additionalActions)
    }
  });

  Promotions.extend({
    "actions.$.actionKey": {
      allowedValues: additionalActions
    }
  });

  Promotions.extend({
    "triggers.$.triggerKey": {
      allowedValues: Promotions.getDefinition(
        "triggers.$.triggerKey",
        ["allowedValues"]
      ).type[0].allowedValues.concat(additionalTriggers)
    }
  });
  // console.log("schemas extended", Promotions._schema.offerRule);
}
