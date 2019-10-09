/**
 *
 * @method getVariants
 * @summary Get all of a Product's Variants or only a Product's top level Variants.
 * @param {Object} context - an object containing the per-request state
 * @param {String} productOrVariantId - A Product or top level Product Variant ID.
 * @param {Boolean} topOnly - True to return only a products top level variants.
 * @returns {Promise<Object[]>} Array of Product Variant objects.
 */
export default async function getVariants(context, productOrVariantId, topOnly) {
  const { collections } = context;
  const { Products } = collections;

  return Products.find({
    ancestors: topOnly ? [productOrVariantId] : productOrVariantId,
    type: "variant",
    isVisible: true,
    isDeleted: { $ne: true }
  }).toArray();
}
