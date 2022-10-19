/**
 * @summary update a single promotion
 * @param {undefined} _ - unused
 * @param {Object} args - The arguments passed to the mutation
 * @param {Object} context - The application context
 * @return {Promise<boolean>} - true if success
 */
export default async function createPromotion(_, args, context) {
  const { input: { _id, promotion: updatedPromotion }, collections: { Promotions } } = context;
  const results = Promotions.updateOne({ _id }, { $set: updatedPromotion });
  return !!results;
}
