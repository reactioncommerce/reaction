import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import * as applyItemDiscountToCart from "./applyItemDiscountToCart.js";

test("createItemDiscount should return correct discount item object", () => {
  const parameters = {
    actionKey: "test",
    promotion: {
      _id: "promotion1"
    },
    actionParameters: {
      discountType: "test",
      discountCalculationType: "test",
      discountValue: 10
    }
  };

  const itemDiscount = applyItemDiscountToCart.createItemDiscount(parameters);

  expect(itemDiscount).toEqual({
    promotionId: "promotion1",
    discountType: "test",
    discountCalculationType: "test",
    discountValue: 10,
    dateApplied: expect.any(Date)
  });
});

test("should return cart with applied discount when parameters do not include rule", async () => {
  const item = {
    _id: "item1",
    price: {
      amount: 12
    },
    quantity: 1,
    subtotal: {
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    },
    discounts: []
  };

  const cart = {
    _id: "cart1",
    items: [item]
  };

  const discountParameters = {
    actionKey: "test",
    promotion: {
      _id: "promotion1"
    },
    actionParameters: {
      discountType: "test",
      discountCalculationType: "test",
      discountValue: 10
    }
  };

  mockContext.promotions = {
    operators: {}
  };

  mockContext.discountCalculationMethods = {
    test: jest.fn().mockReturnValue(10)
  };

  const result = await applyItemDiscountToCart.default(mockContext, discountParameters, cart);

  expect(result).toEqual({
    cart,
    discountedItems: [item]
  });
});

test("should return cart with applied discount when parameters include rule", async () => {
  const item = {
    _id: "item1",
    price: {
      amount: 12
    },
    quantity: 2,
    subtotal: {
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    },
    discounts: []
  };

  const cart = {
    _id: "cart1",
    items: [item]
  };

  const parameters = {
    actionKey: "test",
    promotion: {
      _id: "promotion1"
    },
    actionParameters: {
      discountType: "test",
      discountCalculationType: "test",
      discountValue: 10,
      inclusionRule: {
        conditions: {
          any: [
            {
              fact: "item",
              path: "$.quantity",
              operator: "greaterThanInclusive",
              value: 1
            }
          ]
        }
      }
    }
  };

  mockContext.promotions = {
    operators: {}
  };

  mockContext.discountCalculationMethods = {
    test: jest.fn().mockReturnValue(10)
  };

  const result = await applyItemDiscountToCart.default(mockContext, parameters, cart);

  expect(result).toEqual({
    cart,
    discountedItems: [item]
  });
});
