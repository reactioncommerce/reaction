/**
 * @summary validate the parameters of the particular trigger
 * @param {Object} context - The application context
 * @param {Object} promotion - The promotion to validate
 * @returns {undefined} throws error if invalid
 */
export default function validateTriggerParams(context, promotion) {
  const { promotions } = context;
  for (const trigger of promotion.triggers) {
    const triggerData = promotions.triggers.find((tr) => tr.key === trigger.triggerKey);
    const { paramSchema } = triggerData;
    paramSchema.validate(trigger.triggerParameters);
  }
}
