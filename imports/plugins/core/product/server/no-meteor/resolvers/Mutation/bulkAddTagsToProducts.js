/**
 *
 * @method bulkAddTagsToProducts
 * @summary Takes an array of productsIds and tagsIds
 * and performs a bulk operation to add an array of tag ids to an
 * array of products
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.productIds - an array of Product IDs
 * @param {String[]} args.input.tagIds - an array of Tag IDs
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} Returns an object with information about the results
 * of the bulk operation
 */
export default async function bulkAddTagsToProducts(_, { input }, context) {
  const { clientMutationId } = input;

  const results = await context.mutations.bulkAddTagsToProducts(context, input);

  return {
    clientMutationId,
    ...results
  };
}
