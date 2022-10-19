/**
 *
 * @method updateProduct
 * @summary Updates various product fields
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - the promotion to update
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} updateProduct payload
 */
export default async function updateProduct(_, { input }, context) {
  const promotion = input;
  const { shopId } = input;
  const updatedPromotion = await context.mutations.updatePromotion(context, { shopId, promotion });
  return updatedPromotion;
}
