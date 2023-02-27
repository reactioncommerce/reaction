/**
 *
 * @method archivePromotion
 * @summary Mark a promotion as archived
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - the promotionId of the promotion to archive
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} archiveProduct payload
 */
export default async function archivePromotion(_, { input }, context) {
  const { promotionId, shopId } = input;
  await context.validatePermissions("reaction:legacy:promotions", "update", { shopId });
  const updatedPromotion = await context.mutations.archivePromotion(context, { shopId, promotionId });
  return updatedPromotion;
}
