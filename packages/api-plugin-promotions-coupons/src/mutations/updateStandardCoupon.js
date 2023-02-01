import _ from "lodash";
import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { Coupon } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  _id: String,
  shopId: String,
  name: {
    type: String,
    optional: true
  },
  code: {
    type: String,
    optional: true
  },
  canUseInStore: {
    type: Boolean,
    optional: true
  },
  maxUsageTimesPerUser: {
    type: Number,
    optional: true
  },
  maxUsageTimes: {
    type: Number,
    optional: true
  }
});

/**
 * @method updateStandardCoupon
 * @summary Update a standard coupon mutation
 * @param {Object} context - The application context
 * @param {Object} input - The coupon input to create
 * @returns {Promise<Object>} with updated coupon result
 */
export default async function updateStandardCoupon(context, input) {
  inputSchema.validate(input);

  const { collections: { Coupons, Promotions } } = context;
  const { shopId, _id: couponId } = input;

  const coupon = await Coupons.findOne({ _id: couponId, shopId, isArchived: { $ne: true } });
  if (!coupon) throw new ReactionError("not-found", "Coupon not found");

  const promotion = await Promotions.findOne({ _id: coupon.promotionId, shopId });
  if (!promotion) throw new ReactionError("not-found", "Promotion not found");

  const now = new Date();
  if (promotion.startDate <= now) {
    throw new ReactionError("invalid-params", "Cannot update a coupon for a promotion that has already started");
  }

  if (input.code && coupon.code !== input.code) {
    const existsCoupons = await Coupons.find({ code: input.code, shopId, _id: { $ne: coupon._id }, isArchived: { $ne: true } }).toArray();
    if (existsCoupons.length > 0) {
      const promotionIds = _.map(existsCoupons, "promotionId");
      const promotions = await Promotions.find({ _id: { $in: promotionIds } }).toArray();
      for (const existsPromotion of promotions) {
        if (existsPromotion.startDate <= promotion.startDate && existsPromotion.endDate >= promotion.endDate) {
          throw new ReactionError(
            "invalid-params",
            // eslint-disable-next-line max-len
            "A promotion with this coupon code is already set to be active during part of this promotion window. Please either adjust your coupon code or your Promotion Start and End Dates"
          );
        }
      }
    }
  }

  const modifiedCoupon = _.merge(coupon, input);
  modifiedCoupon.updatedAt = now;

  Coupon.clean(modifiedCoupon, { mutate: true });
  Coupon.validate(modifiedCoupon);

  const modifier = { $set: modifiedCoupon };
  const results = await Coupons.findOneAndUpdate({ _id: couponId, shopId }, modifier, { returnDocument: "after" });

  const { modifiedCount, value } = results;
  return { success: !!modifiedCount, coupon: value };
}
