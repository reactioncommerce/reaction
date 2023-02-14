import _ from "lodash";
import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Coupon } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  promotionId: String,
  name: String,
  code: String,
  canUseInStore: Boolean,
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
 * @method createStandardCoupon
 * @summary Create a standard coupon mutation
 * @param {Object} context - The application context
 * @param {Object} input - The coupon input to create
 * @returns {Promise<Object>} with created coupon result
 */
export default async function createStandardCoupon(context, input) {
  inputSchema.validate(input);

  const { collections: { Coupons, Promotions } } = context;
  const { shopId, promotionId, code } = input;

  const promotion = await Promotions.findOne({ _id: promotionId, shopId });
  if (!promotion) throw new ReactionError("not-found", "Promotion not found");

  if (promotion.triggerType !== "explicit") {
    throw new ReactionError("invalid-params", "Coupon can only be created for explicit promotions");
  }

  const existsCoupons = await Coupons.find({ code, shopId, isArchived: { $ne: true } }).toArray();
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

  const now = new Date();
  const coupon = {
    _id: Random.id(),
    name: input.name,
    code: input.code,
    shopId,
    promotionId,
    expirationDate: promotion.endDate,
    canUseInStore: input.canUseInStore || false,
    maxUsageTimesPerUser: input.maxUsageTimesPerUser || 0,
    maxUsageTimes: input.maxUsageTimes || 0,
    usedCount: 0,
    createdAt: now,
    updatedAt: now
  };

  Coupon.validate(coupon);

  const results = await Coupons.insertOne(coupon);

  const { insertedId, result } = results;
  coupon._id = insertedId;
  return { success: result.n === 1, coupon };
}
