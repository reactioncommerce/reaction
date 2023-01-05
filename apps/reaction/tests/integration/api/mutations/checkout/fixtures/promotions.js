export const fixedDiscountPromotion = {
  name: "$10 off when you spend more than $100",
  label: "Order promotion",
  description: "$10 off when you spend more than $100",
  actions: [
    {
      actionKey: "discounts",
      actionParameters: {
        discountType: "order",
        discountCalculationType: "fixed",
        discountValue: 10
      }
    }
  ],
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "$10 off when you spend more than $100",
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
  promotionType: "order-discount",
  enabled: true,
  stackability: {
    key: "all",
    parameters: {}
  }
};

export const percentagePromotion = {
  name: "%10 off when you spend more than $100",
  description: "%10 off when you spend more than $100",
  actions: [
    {
      actionKey: "discounts",
      actionParameters: {
        discountType: "order",
        discountCalculationType: "percentage",
        discountValue: 10
      }
    }
  ],
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "%10 off when you spend more than $100",
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
  triggerType: "implicit",
  promotionType: "order-discount",
  enabled: true,
  stackability: {
    key: "all",
    parameters: {}
  }
};
