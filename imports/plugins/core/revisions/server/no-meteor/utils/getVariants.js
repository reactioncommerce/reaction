/**
 *
 * @method getVariants
 * @summary Get all of a Product's Variants or only a Product's top level Variants.
 * This function will return UNPUBLISHED variant Revisions.
 * @todo: Revisit why this function is returning unpublished variant revisions.
 * @param {string} productOrVariantId - A Product or top level Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @param {boolean} topOnly - True to return only a products top level variants.
 * @return {Promise<Object[]>} Array of Product Variant objects.
 */
export default async function getVariants(productOrVariantId, collections, topOnly) {
  const { Products, Revisions } = collections;
  const variants = [];

  const productVariants = await Products.find({
    ancestors: topOnly ? [productOrVariantId] : productOrVariantId,
    type: "variant",
    isDeleted: { $ne: true }
  }).toArray();

  await Promise.all(productVariants.map(async (variant) => {
    const revision = await Revisions.findOne({
      "documentId": variant._id,
      "workflow.status": {
        $nin: ["revision/published"]
      }
    });

    if (revision && revision.documentData.isVisible) {
      variants.push(revision.documentData);
    } else if (!revision && variant.isVisible) {
      variants.push(variant);
    }
  }));

  return variants;
}
