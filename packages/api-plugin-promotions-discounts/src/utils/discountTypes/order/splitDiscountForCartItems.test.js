import splitDiscountForCartItems from "./splitDiscountForCartItems.js";

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

  const discountForEachItem = splitDiscountForCartItems(totalDiscount, cartItems);
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
