/**
 * @summary query the coupons collection for a single coupon
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - Shop id of the coupon
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} A coupon record or null
 */
export default async function coupon(_, args, context) {
  const { input } = args;
  const { shopId, _id } = input;
  await context.validatePermissions("reaction:legacy:promotions", "read", { shopId });
  return context.queries.coupon(context, {
    shopId, _id
  });
}
