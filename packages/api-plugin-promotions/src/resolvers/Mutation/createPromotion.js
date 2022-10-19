/**
 * @summary create a new promotion
 * @param {undefined} _ - unused
 * @param {Object} args - The arguments passed to the mutation
 * @param {Object} context - The application context
 * @return {Promise<boolean>} - true if success
 */
export default async function createPromotion(_, { input }, context) {
  const promotion = input;
  const { shopId } = input;
  await context.validatePermissions("reaction:legacy:promotions", "create", { shopId });
  const createPromotionResults = await context.mutations.createPromotion(context, promotion);
  return createPromotionResults;
}
