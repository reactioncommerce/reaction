import _ from "lodash";
import handleCartPromotionsAnalysisComplete from "./handleCartPromotionAnalysisComplete.js";

const firstPromotion = {
  _id: "orderPromotion",
  actions: [
    {
      actionKey: "noop",
      actionParameters: {

      }
    }
  ],
  description: "5 percent off your entire order when you spend more then $200",
  enabled: true,
  label: "5 percent off your entire order when you spend more then $200",
  offerRule: {
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
    },
    event: {
      type: "triggerAction",
      params: {
        promotionId: "orderPromotion"
      }
    }
  },
  reportAsTaxable: true,
  shopId: "dSZqgQsyp48EpJzor",
  stackAbility: "none",
  startDate: new Date(),
  triggers: [
    {
      triggerKey: "offers"
    }
  ],
  endDate: new Date()
};

const cart = {
  appliedPromotions: [
    firstPromotion
  ],
  promotionHistory: [
    {
      updatedAt: new Date(),
      promotionsAdded: [
        {
          _id: "orderPromotion",
          actions: [
            {
              actionKey: "noop",
              actionParameters: {

              }
            }
          ],
          description: "5 percent off your entire order when you spend more then $200",
          enabled: true,
          label: "5 percent off your entire order when you spend more then $200",
          offerRule: {
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
            },
            event: {
              type: "triggerAction",
              params: {
                promotionId: "orderPromotion"
              }
            }
          },
          reportAsTaxable: true,
          shopId: "dSZqgQsyp48EpJzor",
          stackAbility: "none",
          startDate: new Date(),
          triggers: [
            {
              triggerKey: "offers"
            }
          ],
          endDate: new Date()
        }
      ],
      promotionsRemoved: [

      ]
    }
  ]
};

const secondPromotion = {
  _id: "offerPromotion",
  actions: [
    {
      actionKey: "applyDiscountToCart",
      actionParameters: {
        discount: {
          _id: "15PercentOffAllKayaks",
          label: "15 Percent Off All Kayaks",
          description: "15 Percent off all Kayaks",
          discountType: "item",
          discountValue: 15,
          discountCalculationType: "percentage",
          inclusionRules: {
            conditions: {
              any: [
                {
                  fact: "item",
                  path: "productVendor",
                  operator: "equal",
                  value: "Products Inc."
                },
                {
                  fact: "item",
                  path: "class",
                  operator: "contains",
                  value: "Kayaks"
                }
              ]
            },
            event: {
              type: "applyDiscount"
            }
          }
        }
      }
    }
  ],
  description: "15% off all Kayaks",
  enabled: false,
  label: "Kayaks 15 percent off",
  offerRule: {
    name: "15% off all Kayaks",
    conditions: {
      any: [
        {
          fact: "cart",
          path: "$.merchandiseTotal",
          operator: "alwaysEqual",
          value: 100
        }
      ]
    },
    event: {
      type: "triggerAction",
      params: {
        promotionId: "offerPromotion"
      }
    }
  },
  reportAsTaxable: true,
  shopId: "dSZqgQsyp48EpJzor",
  stackAbility: "all",
  startDate: new Date(),
  triggers: [
    {
      triggerKey: "offers"
    }
  ]
};

const notOfferPromotion = {
  _id: "notOfferPromotion",
  triggers: [{
    triggerKey: "not-offer"
  }]
};

const appEvents = {
  emit: jest.fn().mockName("appEvents.emit")
};

const context = {
  appEvents,
  mutations: {
    saveCart: (saveCart) => saveCart
  }
};


test("should emit a removal event when offer no longer applies", async () => {
  const myCart = _.cloneDeep(cart);
  const qualifiedPromotions = [];
  const updatedCart = await handleCartPromotionsAnalysisComplete(context, { cart: myCart, qualifiedPromotions, triggerType: "offers" });
  expect(updatedCart.appliedPromotions.length).toEqual(0);
  expect(appEvents.emit).toHaveBeenCalled();
});

test("should add back a promotions when it re-qualifies", async () => {
  const myCart = _.cloneDeep(cart);
  myCart.appliedPromotions = [];
  const qualifiedPromotions = [secondPromotion];
  const updatedCart = await handleCartPromotionsAnalysisComplete(context, { cart: myCart, qualifiedPromotions, triggerType: "offers" });
  expect(updatedCart.appliedPromotions.length).toEqual(1);
});

test("should correctly add the promotion history when a new promotion is added", async () => {
  const myCart = _.cloneDeep(cart);
  const qualifiedPromotions = [firstPromotion, secondPromotion];
  expect(cart.promotionHistory.length).toEqual(1);
  const updatedCart = await handleCartPromotionsAnalysisComplete(context, { cart: myCart, qualifiedPromotions, triggerType: "offers" });
  expect(updatedCart.promotionHistory.length).toEqual(2);
  const newRecord = updatedCart.promotionHistory[1];
  expect(newRecord.promotionsAdded.length).toEqual(1);
});

test("should not remove a not-offer promotion that's on the cart", async () => {
  const myCart = _.cloneDeep(cart);
  myCart.appliedPromotions = [notOfferPromotion];
  const qualifiedPromotions = [];
  const updatedCart = await handleCartPromotionsAnalysisComplete(context, { cart: myCart, qualifiedPromotions, triggerType: "offers" });
  expect(updatedCart.appliedPromotions.length).toEqual(1);
});
