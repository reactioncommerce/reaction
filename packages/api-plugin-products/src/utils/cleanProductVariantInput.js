const variantFieldsThatShouldNotBeDirectlySet = [
  "_id",
  "ancestors",
  "createdAt",
  "shopId",
  "type",
  "updatedAt",
  "workflow"
];

/**
 * @summary Copies and cleans the ProductVariantInput object accepted by the
 *   createProductVariant and updateProductVariant mutations.
 * @param {Object} context App context
 * @param {Object} input Function input
 * @param {Object} input.productVariantInput ProductVariantInput object to clean
 * @return {Promise<Object>} Cleaned ProductVariantInput
 */
export default async function cleanProductVariantInput(context, {
  productVariantInput
}) {
  const input = { ...productVariantInput };

  // ProductVariant.validate call will ensure most validity, but there are certain fields
  // that we never want to allow arbitrary values for because they are controlled by the
  // system. We'll clear those here if someone is trying to set them.
  variantFieldsThatShouldNotBeDirectlySet.forEach((forbiddenField) => {
    delete input[forbiddenField];
  });

  return input;
}
