/* eslint-disable no-await-in-loop */
import Random from "@reactioncommerce/random";
import getCurrentShopTime from "./getCurrentShopTime.js";

/**
 * @summary returns an auto-incrementing integer id for a specific entity
 * @param {Object} db - The db instance
 * @param {String} shopId - The shop ID
 * @param {String} entity - The entity (normally a collection) that you are tracking the ID for
 * @return {Promise<Number>} - The auto-incrementing ID to use
 */
async function incrementSequence(db, shopId, entity) {
  const { value: { value } } = await db.collection("Sequences").findOneAndUpdate(
    { shopId, entity },
    { $inc: { value: 1 } },
    { returnDocument: "after" }
  );
  return value;
}

/**
 * @summary Migration current discounts v2 to version 2
 * @param {Object} db MongoDB `Db` instance
 * @return {undefined}
 */
async function migrationDiscounts(db) {
  const discounts = await db.collection("Discounts").find({}, { _id: 1 }).toArray();

  // eslint-disable-next-line require-jsdoc
  function getDiscountCalculationType(discount) {
    if (discount.calculation.method === "discount") return "percentage";
    if (discount.calculation.method === "shipping") return "shipping";
    if (discount.calculation.method === "sale") return "flat";
    return "fixed";
  }

  for (const { _id } of discounts) {
    const discount = await db.collection("Discounts").findOne({ _id });
    const promotionId = Random.id();

    const now = new Date();
    const shopTime = await getCurrentShopTime(db);

    // eslint-disable-next-line no-await-in-loop
    await db.collection("Promotions").insertOne({
      _id: promotionId,
      shopId: discount.shopId,
      name: discount.code,
      label: discount.code,
      description: discount.code,
      promotionType: "order-discount",
      actions: [
        {
          actionKey: "discounts",
          actionParameters: {
            discountType: discount.discountType === "sale" ? "order" : "item",
            discountCalculationType: getDiscountCalculationType(discount),
            discountValue: Number(discount.discount)
          }
        }
      ],
      triggers: [
        {
          triggerKey: "coupons",
          triggerParameters: {
            conditions: {
              all: [
                {
                  fact: "totalItemAmount",
                  operator: "greaterThanInclusive",
                  value: 0
                }
              ]
            }
          }
        }
      ],
      enabled: discount.conditions.enabled,
      stackability: {
        key: "all",
        parameters: {}
      },
      triggerType: "explicit",
      state: "active",
      startDate: shopTime[discount.shopId],
      createdAt: now,
      updatedAt: now,
      referenceId: await incrementSequence(db, discount.shopId, "Promotions")
    });

    const couponId = Random.id();
    await db.collection("Coupons").insertOne({
      _id: couponId,
      shopId: discount.shopId,
      promotionId,
      name: discount.code,
      code: discount.code,
      canUseInStore: false,
      usedCount: 0,
      expirationDate: null,
      createdAt: now,
      updatedAt: now,
      maxUsageTimesPerUser: discount.conditions.accountLimit,
      maxUsageTimes: discount.conditions.redemptionLimit,
      discountId: discount._id
    });
  }
}

/**
 * @summary Migration current discount to promotion and coupon
 * @param {Object} db - The db instance
 * @param {String} discountId - The discount ID
 * @returns {Object} - The promotion
 */
async function getPromotionByDiscountId(db, discountId) {
  const coupon = await db.collection("Coupons").findOne({ discountId });
  if (!coupon) return null;
  const promotion = await db.collection("Promotions").findOne({ _id: coupon.promotionId });
  if (!promotion) return null;

  promotion.relatedCoupon = {
    couponId: coupon._id,
    couponCode: coupon.code
  };

  return promotion;
}

/**
 * @summary Migration current cart v1 to version 2
 * @param {Object} db - The db instance
 * @returns {undefined}
 */
async function migrateCart(db) {
  const carts = await db.collection("Cart").find({}, { _id: 1 }).toArray();

  for (const { _id } of carts) {
    const cart = await db.findOne({ _id });
    if (cart.version && cart.version === 2) continue;

    if (!cart.billing) continue;

    if (!cart.appliedPromotions) cart.appliedPromotions = [];

    for (const billing of cart.billing) {
      if (!billing.data || !billing.data.discountId) continue;
      const promotion = await getPromotionByDiscountId(db, billing.data.discountId);
      cart.appliedPromotions.push(promotion);
    }

    cart.version = 2;
    await db.collection("Cart").updateOne({ _id: cart._id }, { $set: cart });
  }
}

/**
 * @summary Performs migration up from previous data version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function up({ db, progress }) {
  try {
    await migrationDiscounts(db);
  } catch (err) {
    throw new Error(`Failed to migrate discounts: ${err.message}`);
  }

  progress(50);

  try {
    await migrateCart(db);
  } catch (err) {
    throw new Error("Failed to migrate cart", err.message);
  }
  progress(100);
}

/**
 * @summary Performs migration down from previous data version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function down({ db, progress }) {
  const coupons = await db.collection("Coupons").find(
    { discountId: { $exists: true } },
    { _id: 1, promotionId: 1 }
  ).toArray();

  const couponIds = coupons.map((coupon) => coupon._id);
  await db.collection("Coupons").remove({ _id: { $in: couponIds } });

  const promotionIds = coupons.map((coupon) => coupon.promotionId);
  await db.collection("Promotions").remove({ _id: { $in: promotionIds } });

  const carts = await db.collection("Cart").find({ version: 2 }, { _id: 1 }).toArray();
  for (const { _id } of carts) {
    const cart = await db.collection("Cart").findOne({ _id });
    cart.appliedPromotions.length = 0;
    cart.version = 1;
    await db.collection("Cart").updateOne({ _id: cart._id }, { $set: cart });
  }

  progress(100);
}

export default { down, up };
