import findRevision from "./findRevision";

/**
 * TODO
 * @method
 * @summary
 * @param
 * @param
 * @return
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
