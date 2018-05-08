/**
 *
 * @method getProduct
 * @summary Get a Product object by variant ID.
 * This function will return an UNPUBLISHED Product Revision.
 * @todo: Revisit why this function is returning unpublished product revision.
 * @param {string} variantId - A product variant ID.
 * @param {Object} collections - Raw mongo collections
 * @return {Promise<Object>} Product object
 */
export default async function getProduct(variantId, collections) {
  const { Products, Revisions } = collections;
  const revision = await Revisions.findOne({
    "documentId": variantId,
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
