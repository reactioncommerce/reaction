import _ from "lodash";
import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Coupon } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  promotionId: String,
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

  const existsCoupons = await Coupons.find({ code, shopId }).toArray();
  if (existsCoupons.length > 0) {
    const promotionIds = _.map(existsCoupons, "promotionId");
    const promotions = await Promotions.find({ _id: { $in: promotionIds } }).toArray();

    for (const existsPromotion of promotions) {
      if (existsPromotion.startDate <= promotion.startDate && existsPromotion.endDate >= promotion.endDate) {
        throw new ReactionError("invalid-params", `A coupon code ${code} already exists in this promotion window`);
      }
    }
  }

  const now = new Date();
  const coupon = {
    _id: Random.id(),
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

  const { insertedCount, insertedId } = results;
  coupon._id = insertedId;
  return { success: insertedCount === 1, coupon };
}
