const now = new Date();

const OrderPromotion = {
  _id: "orderPromotion",
  referenceId: 1,
  triggerType: "implicit",
  promotionType: "order-discount",
  name: "50 percent off over $100",
  label: "50 percent off your entire order when you spend more then $200",
  description: "50 percent off your entire order when you spend more then $200",
  enabled: true,
  state: "created",
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
        discountValue: 50,
        neverStackWithOtherItemLevelDiscounts: false
      }
    }
  ],
  startDate: now,
  endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  createdAt: new Date(),
  updatedAt: new Date(),
  stackability: {
    key: "all",
    parameters: {}
  }
};

const OrderItemPromotion = {
  _id: "itemPromotion",
  referenceId: 2,
  triggerType: "implicit",
  promotionType: "item-discount",
  name: "50 percent off when item is over $500",
  label: "50 percent off your entire order when you spend more then $500",
  description: "50 percent off your entire order when you spend more then $500",
  enabled: true,
  state: "created",
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "50 percent off your entire order when you spend more then $500",
        conditions: {
          all: [
            {
              fact: "totalItemAmount",
              operator: "greaterThanInclusive",
              value: 500
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
        discountValue: 50,
        neverStackWithOtherItemLevelDiscounts: false
      }
    }
  ],
  startDate: now,
  endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  stackability: {
    key: "all",
    parameters: {}
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const CouponPromotion = {
  _id: "couponPromotion",
  referenceId: 3,
  name: "Enter code CODE for special offers",
  triggerType: "explicit",
  promotionType: "order-discount",
  label: "Specific coupon code",
  description: "Specific coupon code",
  enabled: true,
  state: "created",
  triggers: [
    {
      triggerKey: "coupons",
      triggerParameters: {
        conditions: {}
      }
    }
  ],
  actions: [
    {
      actionKey: "noop",
      actionParameters: {}
    }
  ],
  startDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  stackability: {
    key: "all",
    parameters: {}
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const Coupon = {
  _id: "couponId",
  code: "CODE",
  name: "20% OFF coupon",
  promotionId: CouponPromotion._id,
  canUseInStore: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

const ShippingPromotion = {
  _id: "shippingPromotion",
  referenceId: 4,
  triggerType: "implicit",
  promotionType: "shipping-discount",
  name: "$5 off over $100",
  label: "$5 off your entire order when you spend more then $100",
  description: "$5 off your entire order when you spend more then $100",
  enabled: true,
  state: "created",
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "$5 off your entire order when you spend more then $100",
        conditions: {
          all: [
            {
              fact: "totalItemAmount",
              operator: "greaterThanInclusive",
              value: 100
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
        discountType: "shipping",
        discountCalculationType: "fixed",
        discountValue: 5
      }
    }
  ],
  startDate: now,
  endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  createdAt: new Date(),
  updatedAt: new Date(),
  stackability: {
    key: "all",
    parameters: {}
  }
};

const promotions = [OrderPromotion, OrderItemPromotion, CouponPromotion, ShippingPromotion];

/**
 * @summary Load promotions fixtures
 * @param {Object} context - The application context
 * @param {String} shopId - The shop to load data into
 * @returns {Promise<void>} undefined
 */
export default async function loadPromotions(context, shopId) {
  const {
    simpleSchemas: { Promotion: PromotionSchema },
    collections: { Promotions, Coupons }
  } = context;
  for (const promotion of promotions) {
    promotion.shopId = shopId;
    PromotionSchema.validate(promotion);
    // eslint-disable-next-line no-await-in-loop
    await Promotions.updateOne({ _id: promotion._id }, { $set: promotion }, { upsert: true });
  }

  Coupon.shopId = shopId;
  await Coupons.updateOne({ _id: Coupon._id }, { $set: Coupon }, { upsert: true });
}
