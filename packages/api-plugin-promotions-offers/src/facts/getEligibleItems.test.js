import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getEligibleItems from "./getEligibleItems.js";

test("should return all items if no rules are provided", async () => {
  const items = [{ _id: "1" }, { _id: "2" }, { _id: "3" }];
  const parameters = {};
  const cart = { _id: "cartId", items };
  const almanac = {
    factValue: jest.fn().mockName("factValue").mockReturnValue(cart)
  };
  const eligibleItems = await getEligibleItems(mockContext, parameters, almanac);
  expect(eligibleItems).toEqual(items);
});

test("should return eligible items if inclusion rule is provided", async () => {
  const items = [
    { _id: "1", brand: "No1 Brand" },
    { _id: "2", brand: "EOM" },
    { _id: "3", brand: "EOM" }
  ];
  const parameters = {
    inclusionRules: {
      conditions: {
        all: [
          {
            fact: "item",
            path: "$.brand",
            operator: "equal",
            value: "No1 Brand"
          }
        ]
      }
    }
  };
  const cart = { _id: "cartId", items };
  const almanac = {
    factValue: jest.fn().mockName("factValue").mockReturnValue(cart)
  };
  mockContext.promotions = {
    operators: { test: jest.fn() }
  };
  mockContext.promotionOfferFacts = { test: jest.fn() };
  const eligibleItems = await getEligibleItems(mockContext, parameters, almanac);
  expect(eligibleItems).toEqual([{ _id: "1", brand: "No1 Brand" }]);
});

test("should remove ineligible items if exclusion rule is provided", async () => {
  const items = [
    { _id: "1", brand: "No1 Brand" },
    { _id: "2", brand: "EOM" },
    { _id: "3", brand: "EOM" }
  ];
  const parameters = {
    exclusionRules: {
      conditions: {
        all: [
          {
            fact: "item",
            path: "$.brand",
            operator: "equal",
            value: "EOM"
          }
        ]
      }
    }
  };
  const cart = { _id: "cartId", items };
  const almanac = {
    factValue: jest.fn().mockName("factValue").mockReturnValue(cart)
  };
  mockContext.promotions = {
    operators: { test: jest.fn() }
  };
  mockContext.promotionOfferFacts = { test: jest.fn() };
  const eligibleItems = await getEligibleItems(mockContext, parameters, almanac);
  expect(eligibleItems).toEqual([{ _id: "1", brand: "No1 Brand" }]);
});
