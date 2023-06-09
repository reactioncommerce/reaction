/**
 * @summary validate the parameters of the particular action
 * @param {Object} context - The application context
 * @param {Object} promotion - The promotion to validate
 * @returns {undefined} throws error if invalid
 */
export default function validateActionParams(context, promotion) {
  const { promotions } = context;
  for (const action of promotion.actions) {
    const actionData = promotions.actions.find((ac) => ac.key === action.triggerKey);
    const { paramSchema } = actionData;
    paramSchema.validate(action.actionParameters);
  }
}
