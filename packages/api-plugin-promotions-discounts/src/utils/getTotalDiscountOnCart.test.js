import getTotalDiscountOnCart from "./getTotalDiscountOnCart.js";

test("should return the total discount amount for all cart items", () => {
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

  const totalDiscount = getTotalDiscountOnCart(cart);

  expect(totalDiscount).toEqual(4);
});
