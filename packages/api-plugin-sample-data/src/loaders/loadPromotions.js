const now = new Date();

const OrderPromotion = {
  _id: "orderPromotion",
  referenceId: 1,
  triggerType: "implicit",
  promotionType: "order-discount",
  name: "5 percent off over $100",
  label: "5 percent off your entire order when you spend more then $10",
  description: "5 percent off your entire order when you spend more then $10",
  enabled: false,
  state: "created",
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "5 percent off your entire order when you spend more then $10",
        conditions: {
          all: [
            {
              fact: "totalItemAmount",
              operator: "greaterThanInclusive",
              value: 10
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
        discountValue: 5,
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

const promotions = new Array(10).fill(OrderPromotion).map((promotion, index) => ({
  ...promotion,
  _id: `orderPromotion${index}`,
  referenceId: index,
}));

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
