/**
 * @method isAncestorDeleted
 * @summary Verify there are no deleted ancestors
 * Variants cannot be created / restored if their parent product / variant is deleted
 * @param {Object} context - an object containing the per-request state
 * @param  {Object} product - the product object to check for ancestors
 * @param  {Boolean} includeSelf include supplied product
 * @returns {Boolean} true or false
 */
export default async function isAncestorDeleted(context, product, includeSelf) {
  const { collections } = context;
  const { Products } = collections;

  const productIds = [
    ...product.ancestors // Avoid mutations
  ];

  if (includeSelf) {
    productIds.push(product._id);
  }

  // Verify there are no deleted ancestors
  // Variants cannot be created / restored if their parent product / variant is deleted
  const archivedCount = await Products.find({
    _id: { $in: productIds },
    isDeleted: true
  }).count();

  if (archivedCount > 0) {
    return true;
  }

  return false;
}
