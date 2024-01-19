import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import checkShippingStackable from "./checkShippingStackable.js";

test("should returns true if no the current discount is stackable", async () => {
  const shipping = {
    discounts: [
      {
        stackability: { key: "all" }
      }
    ]
  };
  const discount = {
    stackability: { key: "all" }
  };

  mockContext.promotions = {
    stackabilities: [{ key: "all", handler: () => true }]
  };

  const result = await checkShippingStackable(mockContext, shipping, discount);
  expect(result).toBe(true);
});

test("should returns false if the current discount is not stackable", async () => {
  const shipping = {
    discounts: [
      {
        stackability: { key: "all" }
      }
    ]
  };
  const discount = {
    stackability: { key: "none" }
  };

  mockContext.promotions = {
    stackabilities: [
      { key: "all", handler: () => true },
      { key: "none", handler: () => false }
    ]
  };

  const result = await checkShippingStackable(mockContext, shipping, discount);
  expect(result).toBe(false);
});
