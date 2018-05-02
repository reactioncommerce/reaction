/**
 *
 * @method getProduct
 * @summary TODO:
 * @param {string} variantId - TODO:
 * @param {Object} collections - TODO:
 * @return {Object} TODO:
 */
export default async function getProduct(variantId, collections) {
  const { Products, Revisions } = collections;
  const revision = await Revisions.findOne({
    documentId: variantId,
    "workflow.status": {
      $nin: ["revision/published"]
    }
  });

  if (revision && revision.documentData) {
    return revision.documentData;
  }

  const product = await Products.findOne({ _id: variantId });
  return product;
}
