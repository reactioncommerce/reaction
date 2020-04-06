/**
 *
 * @method hasChildVariant
 * @summary Return true if a Product or Variant has at least 1 child Product that is visible and not deleted.
 * @param {String} productOrVariantId - A Product or Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @returns {Promise<boolean>} True if Product has a child.
 */
export default async function hasChildVariant(productOrVariantId, collections) {
  const { Products } = collections;
  const child = await Products.findOne({
    ancestors: productOrVariantId,
    type: "variant",
    isVisible: true,
    isDeleted: { $ne: true }
  });
  return !!child;
}
