import resetCartDiscountState from "./resetCartDiscountState.js";

test("should reset the cart discount state", () => {
  const cart = {
    discounts: [{ _id: "discount1" }],
    discount: 10,
    items: [
      {
        _id: "item1",
        discounts: [{ _id: "discount1" }],
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
    ]
  };

  const updatedCart = resetCartDiscountState({}, cart);

  expect(updatedCart).toEqual({
    discounts: [],
    discount: 0,
    items: [
      {
        _id: "item1",
        discounts: [],
        price: {
          amount: 12
        },
        quantity: 1,
        subtotal: {
          amount: 12,
          currencyCode: "USD"
        }
      }
    ]
  });
});
