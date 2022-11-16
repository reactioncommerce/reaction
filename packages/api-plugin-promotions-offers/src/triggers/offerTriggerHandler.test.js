import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import merchandiseTotal from "../enhancers/merchandiseTotal.js";
import createEngine from "../utils/engineHelpers.js";
import { offerTriggerHandler } from "./offerTriggerHandler.js";

jest.mock("../utils/engineHelpers.js");

const pluginPromotion = {
  operators: {}
};

const promotionOfferFacts = {
  testHandler: jest.fn().mockName("testFactHandler")
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

beforeEach(() => {
  createEngine.mockImplementation((context, rule) => {
    const actualCreateEngine = jest.requireActual("../utils/engineHelpers.js").default;
    return actualCreateEngine(context, rule);
  });
});

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

test("should add custom fact when facts provided on parameters", async () => {
  const cart = {
    _id: "cartId",
    items: [{ _id: "product-1", price: { amount: 100 }, quantity: 2 }]
  };
  const enhancedCart = merchandiseTotal(mockContext, cart);

  mockContext.promotions = pluginPromotion;
  mockContext.promotionOfferFacts = promotionOfferFacts;
  const parameters = {
    ...triggerParameters,
    facts: [
      {
        fact: "testFact",
        handlerName: "testHandler"
      }
    ]
  };
  const mockAddFact = jest.fn().mockName("addFact");
  createEngine.mockReturnValueOnce({
    addFact: mockAddFact,
    run: jest.fn().mockName("run").mockResolvedValue({ failureResults: [] })
  });

  await offerTriggerHandler(mockContext, enhancedCart, { triggerParameters: parameters });

  expect(mockAddFact).toHaveBeenNthCalledWith(1, "eligibleItems", expect.any(Function));
  expect(mockAddFact).toHaveBeenNthCalledWith(2, "totalItemAmount", expect.any(Function));
  expect(mockAddFact).toHaveBeenNthCalledWith(3, "totalItemCount", expect.any(Function));
});

test("should not add custom fact when not provided on parameters", async () => {
  const cart = {
    _id: "cartId",
    items: [{ _id: "product-1", price: { amount: 100 }, quantity: 2 }]
  };
  const enhancedCart = merchandiseTotal(mockContext, cart);

  mockContext.promotions = pluginPromotion;
  mockContext.promotionOfferFacts = promotionOfferFacts;
  const mockAddFact = jest.fn().mockName("addFact");
  createEngine.mockReturnValueOnce({
    addFact: mockAddFact,
    run: jest.fn().mockName("run").mockResolvedValue({ failureResults: [] })
  });

  await offerTriggerHandler(mockContext, enhancedCart, { triggerParameters });

  expect(mockAddFact).toHaveBeenCalledWith("eligibleItems", expect.any(Function));
  expect(mockAddFact).not.toHaveBeenCalledWith("testFact", expect.any(Function));
});
