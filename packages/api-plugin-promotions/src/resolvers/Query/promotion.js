/**
 * @summary query the promotions collection for a single promotion
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - Shop id of the promotion
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} A promotion record or null
 */
export default async function promotion(_, args, context) {
  const { input } = args;
  const { shopId, _id } = input;
  await context.validatePermissions("reaction:legacy:promotions", "read", { shopId });
  return context.queries.promotion(context, {
    shopId, _id
  });
}
