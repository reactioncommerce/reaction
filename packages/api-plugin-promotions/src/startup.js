
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
  const { simpleSchemas: { Promotion } } = context;
  // if (additionalActions.length) {
  //   Promotion.extend({
  //     "actions.$.actionKey": {
  //       allowedValues: Promotion.getDefinition(
  //         "actions.$.actionKey",
  //         ["allowedValues"]
  //       ).type[0].allowedValues.concat(additionalActions)
  //     }
  //   });
  // }

  // Promotion.extend({
  //   "triggers.$.triggerKey": {
  //     allowedValues: Promotion.getDefinition(
  //       "triggers.$.triggerKey",
  //       ["allowedValues"]
  //     ).type[0].allowedValues.concat(additionalTriggers)
  //   }
  // });
  // console.log("schemas extended", Promotions._schema.offerRule);
}
