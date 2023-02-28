/**
 * @summary query the coupons collection for a single coupon log
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - Shop id of the coupon
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} A coupon log record or null
 */
export default async function couponLog(_, args, context) {
  const { input } = args;
  const { shopId, _id } = input;
  await context.validatePermissions("reaction:legacy:promotions", "read", { shopId });
  return context.queries.couponLog(context, {
    shopId, _id
  });
}
