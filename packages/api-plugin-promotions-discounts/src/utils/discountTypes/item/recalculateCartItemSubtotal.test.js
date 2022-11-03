import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import recalculateCartItemSubtotal from "./recalculateCartItemSubtotal.js";

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

  recalculateCartItemSubtotal(mockContext, item);

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

  recalculateCartItemSubtotal(mockContext, item);

  expect(item.subtotal).toEqual({
    amount: 7,
    currencyCode: "USD",
    discount: 5,
    undiscountedAmount: 12
  });
});
