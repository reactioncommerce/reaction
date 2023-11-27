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
      discountValue: 10,
      discountMaxValue: 10
    }
  };

  const itemDiscount = applyItemDiscountToCart.createItemDiscount(parameters);

  expect(itemDiscount).toEqual({
    promotionId: "promotion1",
    discountType: "test",
    discountCalculationType: "test",
    discountValue: 10,
    discountMaxValue: 10,
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
      currencyCode: "USD"
    },
    discounts: []
  };

  const shipping = {
    _id: "shipping1",
    shipmentMethod: {
      shippingPrice: 10,
      discount: 2
    }
  };

  const cart = {
    _id: "cart1",
    items: [item],
    shipping: [shipping]
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
    affected: true
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
      currencyCode: "USD"
    },
    discounts: []
  };

  const shipping = {
    _id: "shipping1",
    shipmentMethod: {
      shippingPrice: 10,
      discount: 2
    }
  };

  const cart = {
    _id: "cart1",
    items: [item],
    shipping: [shipping]
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
      inclusionRules: {
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

  mockContext.promotionOfferFacts = { test: jest.fn() };

  const result = await applyItemDiscountToCart.default(mockContext, parameters, cart);

  expect(result).toEqual({
    cart,
    affected: true
  });
});


test("should return affected is false with reason when have no items are discounted", async () => {
  const item = {
    _id: "item1",
    price: {
      amount: 12
    },
    quantity: 1,
    subtotal: {
      amount: 12,
      currencyCode: "USD"
    },
    discounts: []
  };

  const shipping = {
    _id: "shipping1",
    shipmentMethod: {
      shippingPrice: 11,
      discount: 2
    }
  };

  const cart = {
    _id: "cart1",
    items: [item],
    shipping: [shipping]
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
      inclusionRules: {
        conditions: {
          any: [
            {
              fact: "item",
              path: "$.quantity",
              operator: "greaterThanInclusive",
              value: 2
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

  mockContext.promotionOfferFacts = { test: jest.fn() };

  const result = await applyItemDiscountToCart.default(mockContext, parameters, cart);

  expect(result).toEqual({
    cart,
    affected: false,
    reason: "No items were discounted"
  });
});

test("canBeApplyDiscountToItem: should return true when item don't have any discounts", () => {
  const item = {
    _id: "item1",
    discounts: []
  };

  const discountItem = {
    discountType: "test",
    discountCalculationType: "test",
    discountValue: 10
  };

  const result = applyItemDiscountToCart.canBeApplyDiscountToItem(item, discountItem);

  expect(result).toBe(true);
});

test("canBeApplyDiscountToItem: should return true when item has only discount order type", () => {
  const item = {
    discounts: [
      {
        discountType: "order"
      }
    ]
  };
  const result = applyItemDiscountToCart.canBeApplyDiscountToItem(item);

  expect(result).toBe(true);
});

test("canBeApplyDiscountToItem: should return false when applied discount neverStackWithOtherItemLevelDiscounts is true", () => {
  const item = {
    discounts: [
      {
        discountType: "item",
        neverStackWithOtherItemLevelDiscounts: true
      }
    ]
  };
  const result = applyItemDiscountToCart.canBeApplyDiscountToItem(item);

  expect(result).toBe(false);
});

test("canBeApplyDiscountToItem: should return false when discount neverStackWithOtherItemLevelDiscounts is false", () => {
  const item = {
    discounts: [
      {
        discountType: "item",
        neverStackWithOtherItemLevelDiscounts: true
      }
    ]
  };
  const discountItem = {
    discountType: "item",
    neverStackWithOtherItemLevelDiscounts: false
  };
  const result = applyItemDiscountToCart.canBeApplyDiscountToItem(item, discountItem);

  expect(result).toBe(false);
});

test("canBeApplyDiscountToItem: should return true when discount and applied discount have neverStackWithOtherItemLevelDiscounts is false", () => {
  const item = {
    discounts: [
      {
        discountType: "item",
        neverStackWithOtherItemLevelDiscounts: false
      }
    ]
  };
  const discountItem = {
    discountType: "item",
    neverStackWithOtherItemLevelDiscounts: false
  };
  const result = applyItemDiscountToCart.canBeApplyDiscountToItem(item, discountItem);

  expect(result).toBe(true);
});
