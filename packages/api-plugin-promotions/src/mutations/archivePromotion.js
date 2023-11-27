/**
 * @summary archive a single promotion
 * @param {Object} context - The application context
 * @param {String} shopId - The shopId of the promotion to archive
 * @param {Object} promotion - the id of the promotion to archive
 * @return {Promise<Object>} - updated Promotion
 */
export default async function archivePromotion(context, { shopId, promotionId }) {
  const { collections: { Promotions } } = context;
  const now = new Date();
  const { value } = await Promotions.findOneAndUpdate(
    { _id: promotionId, shopId },
    { $set: { state: "archived", updatedAt: now } },
    { returnDocument: "after" }
  );
  if (!value) {
    return {
      success: false,
      errors: [
        { message: "Unable to find record to update" }
      ]
    };
  }
  return { success: true, promotion: value };
}
