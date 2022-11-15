import setDiscountsOnCart from "./setDiscountsOnCart.js";

jest.mock("../queries/getDiscountsTotalForCart.js", () => jest.fn().mockReturnValue({ total: 10 }));

test("should set discounts on cart when discountCalculationMethods doesn't exist", async () => {
  const context = {};
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
      }
    ]
  };

  await setDiscountsOnCart(context, cart);

  expect(cart.discount).toBe(10);
});

test("shouldn't set discounts on cart when discountCalculationMethods exists", async () => {
  const context = {
    discountCalculationMethods: {}
  };
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
      }
    ]
  };

  await setDiscountsOnCart(context, cart);

  expect(cart.discount).toBeUndefined();
});
