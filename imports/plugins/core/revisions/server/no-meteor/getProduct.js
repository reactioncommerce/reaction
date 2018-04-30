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
  const product = await Products.findOne(variantId);
  const revision = await findRevision(
    {
      documentId: variantId
    },
    collections
  );

  return (revision && revision.documentData) || product;
}
