/**
 *
 * @method getVariants
 * @summary TODO:
 * @param {string} productOrVariantId - TODO:
 * @param {string} type - TODO:
 * @param {Object} collections - TODO:
 * @return {Promise<Object[]>} TODO:
 */
export default async function getVariants(proudctOrVariantId, collections, topOnly) {
  const { Products, Revisions } = collections;
  const variants = [];

  const productVariants = await Products.find({
    ancestors: topOnly ? [proudctOrVariantId] : proudctOrVariantId,
    type: "variant",
    isDeleted: false
  }).toArray();

  await Promise.all(
    productVariants.map(async (variant) => {
      const revision = await Revisions.findOne({
        documentId: variant._id,
        "workflow.status": {
          $nin: ["revision/published"]
        }
      });

      if (revision && revision.documentData.isVisible) {
        variants.push(revision.documentData);
      } else if (!revision && variant.isVisible) {
        variants.push(variant);
      }
    })
  );
  return variants;
}
