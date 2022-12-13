/**
 *
 * @method updatePromotion
 * @summary Updates a promotion
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - the promotion to update
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} updateProduct payload
 */
export default async function updatePromotion(_, { input }, context) {
  const promotion = input;
  const { shopId } = input;
  await context.validatePermissions("reaction:legacy:promotions", "update", { shopId });
  const updatedPromotion = await context.mutations.updatePromotion(context, { promotion, shopId });
  return updatedPromotion;
}
