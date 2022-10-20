import { calculateMerchandiseTotal } from "./calculateMerchandiseTotal.js";

test("calculates the merchandise total for a cart", () => {
  const cart = {
    items: [
      {
        price: {
          amount: 10
        },
        quantity: 1
      },
      {
        price: {
          amount: 20
        },
        quantity: 2
      }
    ]
  };

  expect(calculateMerchandiseTotal(cart)).toEqual(50);
});
