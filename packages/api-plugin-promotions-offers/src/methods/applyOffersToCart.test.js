import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import applyOffersToCart from "./applyOfersToCart.js";

mockContext.collections.Promotions = mockCollection("Promotions");
const now = new Date();

const mockPromotions = [
  {
    _id: "orderPromotion",
    label: "5 percent off your entire order when you spend more then $200",
    description: "5 percent off your entire order when you spend more then $200",
    enabled: true,
    triggers: [{ triggerKey: "offers" }],
    offerRule: {
      name: "5 percent off your entire order when you spend more then $200",
      conditions: {
        any: [{
          fact: "cart",
          path: "$.merchandiseTotal",
          operator: "greaterThanInclusive",
          value: 200
        }]
      },
      event: { // define the event to fire when the conditions evaluate truthy
        type: "triggerAction",
        params: {
          promotionId: "orderPromotion"
        }
      }
    },
    actions: [{
      actionKey: "noop",
      actionParameters: {}
    }],
    startDate: now,
    stackAbility: "none",
    reportAsTaxable: true
  }
];

const context = mockContext;
context.promotions = {
  operators: {}
};

test("when the cart value is over $100, apply a 10% discount", async () => {
  const cart = {
    subtotal: {
      amount: 300.00
    },
    items: [
      {
        quantity: 10,
        price: {
          amount: 30.00
        }
      }
    ]
  };
  mockContext.collections.Promotions.toArray.mockReturnValue(Promise.resolve(mockPromotions));
  const results = await applyOffersToCart(context, cart);
  expect(results[0].events[0].type).toEqual("triggerAction");
  expect(results[0].events[0].params.promotionId).toEqual("orderPromotion");
  return results;
});

test("promotions are not applied when criteria is not met", async () => {
  const cart = {
    subtotal: {
      amount: 30.00
    },
    items: [
      {
        quantity: 1,
        price: {
          amount: 30.00
        }
      }
    ]
  };
  mockContext.collections.Promotions.toArray.mockReturnValue(Promise.resolve(mockPromotions));
  const results = await applyOffersToCart(context, cart);
  expect(results[0].events.length).toEqual(0);
  return results;
});

test("works fine when there are no valid promotions", async () => {
  const cart = {
    subtotal: {
      amount: 30.00
    },
    items: [
      {
        quantity: 1,
        price: {
          amount: 30.00
        }
      }
    ]
  };
  mockContext.collections.Promotions.toArray.mockReturnValue(Promise.resolve([]));
  const results = await applyOffersToCart(context, cart);
  expect(results).toEqual([]);
  return results;
});
