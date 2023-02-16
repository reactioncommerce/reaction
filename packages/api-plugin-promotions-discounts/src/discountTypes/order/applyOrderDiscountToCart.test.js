import _ from "lodash";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import * as applyOrderDiscountToCart from "./applyOrderDiscountToCart.js";

test("createDiscountRecord should create discount record", () => {
  const parameters = {
    actionKey: "test",
    promotion: {
      _id: "promotion1"
    },
    actionParameters: {
      discountType: "item",
      discountCalculationType: "fixed",
      discountValue: 10
    }
  };

  const discountedItems = [
    {
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
    }
  ];

  const discountRecord = applyOrderDiscountToCart.createDiscountRecord(parameters, discountedItems, 2);

  expect(discountRecord).toEqual({
    promotionId: "promotion1",
    discountType: "item",
    discountCalculationType: "fixed",
    discountValue: 10,
    dateApplied: expect.any(Date),
    discountedItemType: "item",
    discountedAmount: 2,
    discountedItems
  });
});

test("should apply order discount to cart", async () => {
  const cart = {
    _id: "cart1",
    items: [
      {
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
      },
      {
        _id: "item2",
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
      }
    ],
    shipping: []
  };

  const parameters = {
    actionKey: "test",
    promotion: { _id: "promotion1" },
    actionParameters: {
      discountType: "order",
      discountCalculationType: "fixed",
      discountValue: 10,
      discountedAmount: 2
    }
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(2)
  };

  await applyOrderDiscountToCart.default(mockContext, parameters, cart);
  const orderDiscountItem = applyOrderDiscountToCart.createDiscountRecord(parameters, cart.items, 2);

  expect(cart.items[0].subtotal).toEqual({
    amount: 3,
    currencyCode: "USD",
    discount: 9,
    undiscountedAmount: 12
  });

  expect(cart.items[1].subtotal).toEqual({
    amount: 3,
    currencyCode: "USD",
    discount: 9,
    undiscountedAmount: 12
  });

  const discountedItems = cart.items.map((item) => ({ _id: item._id, amount: 9 }));
  expect(cart.discounts).toEqual([{ ...orderDiscountItem, discountedAmount: 18, dateApplied: expect.any(Date), discountedItems }]);
});

test("getCartDiscountAmount get should return correct discount amount", () => {
  const items = [
    {
      _id: "item1",
      price: {
        amount: 12
      },
      quantity: 1,
      subtotal: {
        amount: 10,
        currencyCode: "USD"
      }
    }
  ];

  const discount = {
    discountCalculationType: "fixed",
    discountValue: 5
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(5)
  };

  expect(applyOrderDiscountToCart.getCartDiscountAmount(mockContext, items, discount)).toEqual(5);
});

test("should split discount for cart items", () => {
  const totalDiscount = 10;
  const cartItems = [
    {
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
    },
    {
      _id: "item2",
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
    }
  ];

  const discountForEachItem = applyOrderDiscountToCart.splitDiscountForCartItems(totalDiscount, cartItems);
  expect(discountForEachItem).toEqual([
    {
      _id: "item1",
      amount: 5
    },
    {
      _id: "item2",
      amount: 5
    }
  ]);
});

test("the total discounted items should be equal total discount amount", () => {
  const totalDiscount = 10;
  const cartItems = [
    {
      _id: "item1",
      quantity: 1,
      subtotal: {
        amount: 10,
        currencyCode: "USD"
      }
    },
    {
      _id: "item2",
      quantity: 1,
      subtotal: {
        amount: 10,
        currencyCode: "USD"
      }
    },
    {
      _id: "item3",
      quantity: 1,
      subtotal: {
        amount: 10,
        currencyCode: "USD"
      }
    }
  ];

  const discountForEachItem = applyOrderDiscountToCart.splitDiscountForCartItems(totalDiscount, cartItems);
  expect(discountForEachItem).toEqual([
    {
      _id: "item1",
      amount: 3.33
    },
    {
      _id: "item2",
      amount: 3.33
    },
    {
      _id: "item3",
      amount: 3.34
    }
  ]);
  expect(_.sumBy(discountForEachItem, "amount")).toEqual(totalDiscount);
});

test("should apply order discount to cart with discountMaxValue when estimate discount higher than discountMaxValue", async () => {
  const cart = {
    _id: "cart1",
    items: [
      {
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
      },
      {
        _id: "item2",
        price: {
          amount: 12
        },
        quantity: 2,
        subtotal: {
          amount: 24,
          currencyCode: "USD"
        },
        discounts: []
      }
    ],
    shipping: []
  };

  const parameters = {
    actionKey: "test",
    promotion: { _id: "promotion1" },
    actionParameters: {
      discountType: "order",
      discountCalculationType: "fixed",
      discountValue: 10,
      discountMaxValue: 5
    }
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(10)
  };

  await applyOrderDiscountToCart.default(mockContext, parameters, cart);

  expect(cart.items[0].subtotal).toEqual({
    amount: 10.33,
    currencyCode: "USD",
    discount: 1.67,
    undiscountedAmount: 12
  });

  expect(cart.items[1].subtotal).toEqual({
    amount: 20.67,
    currencyCode: "USD",
    discount: 3.33,
    undiscountedAmount: 24
  });
});

test("should return affected is false with reason when have no items are discounted", async () => {
  const cart = {
    _id: "cart1",
    items: [],
    shipping: []
  };

  const parameters = {
    actionKey: "test",
    promotion: { _id: "promotion1" },
    actionParameters: {
      discountType: "order",
      discountCalculationType: "fixed",
      discountValue: 10,
      discountMaxValue: 5
    }
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(0)
  };

  const result = await applyOrderDiscountToCart.default(mockContext, parameters, cart);
  expect(result.affected).toBe(false);
  expect(result.reason).toEqual("No items were discounted");
});
