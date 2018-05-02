import findRevision from "./findRevision";

/**
 *
 * @method getProduct
 * @summary TODO:
 * @param {string} variantId - TODO:
 * @param {Object} collections - TODO:
 * @return {Object} TODO:
 */
export default async function getProduct(variantId, collections) {
  const { Products } = collections;
  const revision = await findRevision(
    {
      documentId: variantId
    },
    collections
  );

  if (revision && revision.documentData) {
    return revision.documentData;
  }

  const product = await Products.findOne({ _id: variantId });
  return product;
}
