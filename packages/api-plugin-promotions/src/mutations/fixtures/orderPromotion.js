const now = new Date();

export const CreateOrderPromotion = {
  shopId: "testShop",
  promotionType: "coupon",
  name: "Order Promotion",
  label: "5 percent off your entire order when you spend more then $200",
  description: "5 percent off your entire order when you spend more then $200",
  enabled: true,
  state: "active",
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "5 percent off your entire order when you spend more then $200",
        conditions: {
          any: [
            {
              fact: "cart",
              path: "$.merchandiseTotal",
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
        discountValue: 5
      }
    }
  ],
  startDate: now,
  endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  stackability: {
    key: "all",
    parameters: {}
  }
};

export const ExistingOrderPromotion = {
  _id: "orderPromotion",
  referenceId: 1,
  shopId: "testShop",
  promotionType: "item-discount",
  triggerType: "implicit",
  name: "Order Promotion",
  label: "5 percent off your entire order when you spend more then $200",
  description: "5 percent off your entire order when you spend more then $200",
  enabled: true,
  state: "active",
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "5 percent off your entire order when you spend more then $200",
        conditions: {
          any: [
            {
              fact: "cart",
              path: "$.merchandiseTotal",
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
      actionKey: "noop",
      actionParameters: {}
    }
  ],
  startDate: now,
  endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  stackability: {
    key: "all",
    parameters: {}
  },
  createdAt: now,
  updatedAt: now
};

