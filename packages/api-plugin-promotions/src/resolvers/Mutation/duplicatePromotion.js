/**
 * @summary duplicate an existing promotion
 * @param {undefined} _ - unused
 * @param {Object} args - The arguments passed to the mutation
 * @param {Object} context - The application context
 * @return {Promise<boolean>} - true if success
 */
export default async function duplicatePromotion(_, { input }, context) {
  const { promotionId, shopId } = input;
  await context.validatePermissions("reaction:legacy:promotions", "create", { shopId });
  const duplicatePromotionResults = await context.mutations.duplicatePromotion(context, { shopId, promotionId });
  return duplicatePromotionResults;
}
