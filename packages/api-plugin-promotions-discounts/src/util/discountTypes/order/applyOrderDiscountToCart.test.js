import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import * as applyOrderDiscountToCart from "./applyOrderDiscountToCart.js";

test("createDiscountRecord should create discount record", () => {
  const discount = {
    actionKey: "test",
    promotionId: "promotion1",
    discountType: "item",
    discountCalculationType: "fixed",
    discountValue: 10,
    discountedAmount: 2
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

  const discountRecord = applyOrderDiscountToCart.createDiscountRecord(discount, discountedItems, 2);

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

  const discount = {
    actionKey: "test",
    promotionId: "promotion1",
    discountType: "order",
    discountCalculationType: "fixed",
    discountValue: 10,
    discountedAmount: 2
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(2)
  };

  await applyOrderDiscountToCart.default(mockContext, discount, cart);

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
  expect(cart.discounts).toEqual([
    { ...discount, discountedItemType: "item", dateApplied: expect.any(Date), discountedItems }
  ]);
});
