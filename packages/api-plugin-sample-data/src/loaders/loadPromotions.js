const now = new Date();

const OrderPromotion = {
  _id: "orderPromotion",
  triggerType: "implicit",
  promotionType: "order-discount",
  label: "5 percent off your entire order when you spend more then $200",
  description: "5 percent off your entire order when you spend more then $200",
  enabled: true,
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "50 percent off your entire order when you spend more then $200",
        conditions: {
          all: [
            {
              fact: "totalItemAmount",
              operator: "greaterThanInclusive",
              value: 200
            }
          ]
        }
      }
    }
  ],
  actions: [
    {
      actionKey: "discounts",
      actionParameters: {
        discountType: "order",
        discountCalculationType: "percentage",
        discountValue: 50
      }
    }
  ],
  startDate: now,
  endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  stackAbility: "all"
};

const OrderItemPromotion = {
  _id: "itemPromotion",
  type: "implicit",
  label: "50 percent off your entire order when you spend more then $200",
  description: "50 percent off your entire order when you spend more then $200",
  enabled: true,
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "50 percent off your entire order when you spend more then $200",
        conditions: {
          all: [
            {
              fact: "totalItemAmount",
              operator: "greaterThanInclusive",
              value: 200
            }
          ]
        }
      }
    }
  ],
  actions: [
    {
      actionKey: "discounts",
      actionParameters: {
        discountType: "item",
        discountCalculationType: "percentage",
        discountValue: 50
      }
    }
  ],
  startDate: now,
  endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  stackAbility: "all"
};

const CouponPromotion = {
  _id: "couponPromotion",
  triggerType: "implicit",
  promotionType: "order-discount",
  label: "Specific coupon code",
  description: "Specific coupon code",
  enabled: true,
  triggers: [
    {
      triggerKey: "coupons",
      triggerParameters: {
        name: "Specific coupon code",
        couponCode: "CODE"
      }
    }
  ],
  actions: [
    {
      actionKey: "noop",
      actionParameters: {}
    }
  ],
  startDate: now,
  endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  stackAbility: "all"
};

const promotions = [OrderPromotion, OrderItemPromotion, CouponPromotion];

/**
 * @summary Load promotions fixtures
 * @param {Object} context - The application context
 * @param {String} shopId - The shop to load data into
 * @returns {Promise<void>} undefined
 */
export default async function loadPromotions(context, shopId) {
  const {
    simpleSchemas: { Promotion: PromotionSchema },
    collections: { Promotions }
  } = context;
  for (const promotion of promotions) {
    promotion.shopId = shopId;
    PromotionSchema.validate(promotion);
    // eslint-disable-next-line no-await-in-loop
    await Promotions.updateOne({ _id: promotion._id }, { $set: promotion }, { upsert: true });
  }
}
