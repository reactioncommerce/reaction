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
    actionKey: "test",
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
    ]
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
    amount: 10,
    currencyCode: "USD",
    discount: 2,
    undiscountedAmount: 12
  });

  expect(cart.items[1].subtotal).toEqual({
    amount: 10,
    currencyCode: "USD",
    discount: 2,
    undiscountedAmount: 12
  });

  const discountedItems = cart.items.map((item) => ({ _id: item._id, amount: 1 }));
  expect(cart.discounts).toEqual([{ ...orderDiscountItem, dateApplied: expect.any(Date), discountedItems }]);
});


test(" get should return correct discount amount", () => {
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
        }
      }
    ],
    subtotal: {
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    }
  };

  const discount = {
    discountCalculationType: "fixed",
    discountValue: 10
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(10)
  };

  const discountAmount = getCartDiscountAmount(mockContext, cart, discount);
  expect(discountAmount).toEqual(10);
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

