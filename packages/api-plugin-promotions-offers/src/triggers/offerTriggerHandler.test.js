import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import merchandiseTotal from "../enhancers/merchandiseTotal.js";
import { offerTriggerHandler } from "./offerTriggerHandler.js";

const pluginPromotion = {
  operators: {}
};

const triggerParameters = {
  name: "50% off your entire order when you spend more then $200",
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
};

test("should return true when the cart qualified by promotion", async () => {
  const cart = {
    _id: "cartId",
    items: [{ _id: "product-1", price: { amount: 100 }, quantity: 2 }]
  };
  const enhancedCart = merchandiseTotal(mockContext, cart);

  mockContext.promotions = pluginPromotion;
  expect(await offerTriggerHandler(mockContext, enhancedCart, { triggerParameters })).toBe(true);
});

test("should return false when the cart isn't qualified by promotion", async () => {
  const cart = {
    _id: "cartId",
    items: [{ _id: "product-1", price: { amount: 49 }, quantity: 2 }]
  };
  const enhancedCart = merchandiseTotal(mockContext, cart);

  mockContext.promotions = pluginPromotion;
  expect(await offerTriggerHandler(mockContext, enhancedCart, { triggerParameters })).toBe(false);
});
