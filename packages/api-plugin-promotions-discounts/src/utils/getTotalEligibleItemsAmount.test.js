import getTotalEligibleItemsAmount from "./getTotalEligibleItemsAmount.js";

test("calculates the merchandise total for a cart", () => {
  const items = [
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
  ];

  expect(getTotalEligibleItemsAmount(items)).toEqual(30);
});
