import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import addDiscountToOrderItem from "./addDiscountToOrderItem.js";

test("should add discount to order item when subtotal is an object", () => {
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

  const cartItem = {
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

  const itemWithDiscount = addDiscountToOrderItem(mockContext, { item, cartItem });

  expect(itemWithDiscount).toEqual({
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
  });
});

test("should add discount to order item when subtotal is a number", () => {
  const item = {
    _id: "item1",
    price: {
      amount: 12
    },
    quantity: 1,
    subtotal: 10
  };

  const cartItem = {
    _id: "item1",
    price: {
      amount: 12
    },
    subtotal: {
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    },
    discounts: []
  };

  const itemWithDiscount = addDiscountToOrderItem(mockContext, { item, cartItem });

  expect(itemWithDiscount).toEqual({
    _id: "item1",
    price: {
      amount: 12
    },
    quantity: 1,
    subtotal: 10,
    discount: 2,
    undiscountedAmount: 12,
    discounts: []
  });
});
