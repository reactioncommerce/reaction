import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import * as applyItemDiscountToCart from "./applyItemDiscountToCart.js";

test("createItemDiscount should return correct discount item object", () => {
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
    }
  };

  const discount = {
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

  const itemDiscount = applyItemDiscountToCart.createItemDiscount(item, discount);

  expect(itemDiscount).toEqual({
    actionKey: "test",
    promotionId: "promotion1",
    discountType: "test",
    discountCalculationType: "test",
    discountValue: 10,
    dateApplied: expect.any(Date)
  });
});

test("addDiscountToItem should add discount to item", () => {
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

  const itemDiscount = applyItemDiscountToCart.createItemDiscount(item, parameters);

  applyItemDiscountToCart.addDiscountToItem({}, parameters, { item });

  expect(item.discounts).toEqual([
    {
      ...itemDiscount,
      dateApplied: expect.any(Date)
    }
  ]);
});

test("should return cart with applied discount when parameters not include rule", async () => {
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

  jest.spyOn(applyItemDiscountToCart, "addDiscountToItem").mockImplementation(() => {});

  mockContext.promotions = {
    operators: {}
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

  jest.spyOn(applyItemDiscountToCart, "addDiscountToItem").mockImplementation(() => {});

  mockContext.promotions = {
    operators: {}
  };

  const result = await applyItemDiscountToCart.default(mockContext, parameters, cart);

  expect(result).toEqual({
    cart,
    discountedItems: [item]
  });
});

describe("recalculateCartItemSubtotal", () => {
  test("should recalculate the item subtotal with discountType is item", () => {
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

    const discount = {
      actionKey: "test",
      promotionId: "promotion1",
      discountType: "item",
      discountCalculationType: "fixed",
      discountValue: 10,
      discountedAmount: 2
    };

    item.discounts.push(discount);

    mockContext.discountCalculationMethods = {
      fixed: jest.fn().mockReturnValue(2)
    };

    applyItemDiscountToCart.recalculateCartItemSubtotal(mockContext, item);

    expect(item.subtotal).toEqual({
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    });
  });

  test("should recalculate the item subtotal with discountType is order", () => {
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

    const discount = {
      actionKey: "test",
      promotionId: "promotion1",
      discountType: "order",
      discountCalculationType: "fixed",
      discountValue: 10,
      discountedAmount: 5
    };

    item.discounts.push(discount);

    applyItemDiscountToCart.recalculateCartItemSubtotal(mockContext, item);

    expect(item.subtotal).toEqual({
      amount: 7,
      currencyCode: "USD",
      discount: 5,
      undiscountedAmount: 12
    });
  });
});
