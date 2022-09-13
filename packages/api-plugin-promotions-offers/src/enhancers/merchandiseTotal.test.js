import merchandiseTotal from "./merchandiseTotal.js";

test("merchandise total should return the total of all items in the cart", () => {
  const cart = {
    items: [
      {
        quantity: 3,
        price: {
          amount: 10.00
        }
      },
      {
        quantity: 1,
        price: {
          amount: 19.99
        }
      }
    ]
  };
  const mockContext = {};
  const returnCart = merchandiseTotal(mockContext, cart);
  const { merchandiseTotal: total } = returnCart;
  expect(total).toEqual(49.99);
});
