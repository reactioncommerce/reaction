/**
 *
 * @method getVariants
 * @summary Get all of a Product's Variants or only a Product's top level Variants.
 * @param {Object} context - an object containing the per-request state
 * @param {String} productOrVariantId - A Product or top level Product Variant ID.
 * @param {Boolean} topOnly - True to return only a products top level variants.
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Boolean} args.shouldIncludeHidden - Include hidden products in results
 * @param {Boolean} args.shouldIncludeArchived - Include archived products in results
 * @returns {Promise<Object[]>} Array of Product Variant objects.
 */
export default async function getVariants(context, productOrVariantId, topOnly, args) {
  const { shouldIncludeHidden, shouldIncludeArchived } = args;
  const { collections } = context;
  const { Products } = collections;

  const selector = {
    ancestors: topOnly ? [productOrVariantId] : productOrVariantId,
    type: "variant"
  };

  // Only include visible variants if `false`
  // Otherwise both hidden and visible will be shown
  if (shouldIncludeHidden === false) {
    selector.isVisible = true;
  }

  // Exclude archived (deleted) variants if set to `false`
  // Otherwise include archived variants in the results
  if (shouldIncludeArchived === false) {
    selector.isDeleted = {
      $ne: true
    };
  }

  return Products.find(selector).toArray();
}
