import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema({
  shopId: String,
  couponId: String
});

/**
 * @method archiveCoupon
 * @summary Archive a coupon mutation
 * @param {Object} context - The application context
 * @param {Object} input - The coupon input to create
 * @returns {Promise<Object>} with updated coupon result
 */
export default async function archiveCoupon(context, input) {
  inputSchema.validate(input);

  const { collections: { Coupons } } = context;
  const { shopId, couponId: _id } = input;

  const now = new Date();
  const modifier = { $set: { isArchived: true, updatedAt: now } };
  const results = await Coupons.findOneAndUpdate({ _id, shopId }, modifier, { returnDocument: "after" });

  const { modifiedCount, value } = results;
  return { success: !!modifiedCount, coupon: value };
}
