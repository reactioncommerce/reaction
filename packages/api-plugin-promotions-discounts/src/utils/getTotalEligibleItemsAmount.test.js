import { calculateMerchandiseTotal } from "./calculateMerchandiseTotal.js";

test("calculates the merchandise total for a cart", () => {
  const cart = {
    items: [
      {
        subtotal: {
          amount: 10
        },
        quantity: 1
      },
      {
        subtotal: {
          amount: 20
        },
        quantity: 2
      }
    ]
  };

  expect(calculateMerchandiseTotal(cart)).toEqual(50);
});
